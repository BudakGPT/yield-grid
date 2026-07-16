package budakgpt.yieldgridbackend.modules.grading.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import budakgpt.yieldgridbackend.common.security.CurrentUserService;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.grading.dto.GradingResultResponse;
import budakgpt.yieldgridbackend.modules.grading.dto.VlmGradingResult;
import budakgpt.yieldgridbackend.modules.grading.entity.ProductGrading;
import budakgpt.yieldgridbackend.modules.grading.enums.BuyerSegment;
import budakgpt.yieldgridbackend.modules.grading.enums.ShelfLifeBand;
import budakgpt.yieldgridbackend.modules.grading.repository.ProductGradingRepository;
import budakgpt.yieldgridbackend.modules.stellar.SecretCryptoService;
import budakgpt.yieldgridbackend.modules.stellar.SidecarClient;

@Service
public class GradingService {
    private static final Logger logger = LoggerFactory.getLogger(GradingService.class);
    private static final Set<String> SUPPORTED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );
    private final ProductGradingRepository gradingRepository;
    private final CurrentUserService currentUserService;
    private final UploadStorageService uploadStorageService;
    private final SidecarClient sidecarClient;
    private final SecretCryptoService secretCryptoService;
    private final OpenRouterGradingClient openRouterClient;
    private final ObjectMapper objectMapper;
    private final String gradingMode;

    public GradingService(
            ProductGradingRepository gradingRepository,
            CurrentUserService currentUserService,
            UploadStorageService uploadStorageService,
            SidecarClient sidecarClient,
            SecretCryptoService secretCryptoService,
            OpenRouterGradingClient openRouterClient,
            @Value("${app.grading.mode:rehearsal}") String gradingMode
    ) {
        this.gradingRepository = gradingRepository;
        this.currentUserService = currentUserService;
        this.uploadStorageService = uploadStorageService;
        this.sidecarClient = sidecarClient;
        this.secretCryptoService = secretCryptoService;
        this.openRouterClient = openRouterClient;
        this.objectMapper = new ObjectMapper().findAndRegisterModules();
        this.gradingMode = gradingMode;
    }

    @Transactional
    public GradingOutcome grade(MultipartFile photo, int crateCount, String produceType) {
        UserEntity farmer = currentUserService.requireUser();
        if (farmer.getRole() != Role.SELLER) {
            throw new IllegalArgumentException("Only farmers can create scans");
        }
        if (crateCount < 1 || crateCount > 100) {
            throw new IllegalArgumentException("crate_count must be between 1 and 100");
        }
        String crop = produceType.trim().toLowerCase(Locale.ROOT);
        if (!List.of("tomato", "banana").contains(crop)) {
            throw new IllegalArgumentException("produce_type must be tomato or banana");
        }
        validatePhoto(photo);

        UUID scanId = UUID.randomUUID();
        GradingAttempt attempt = gradingAttempt(photo, crop);
        String photoUrl = uploadStorageService.store(photo, scanId);
        GradingValues values = attempt.values();
        BigDecimal suggestedPrice = crop.equals("tomato") ? new BigDecimal("18000") : new BigDecimal("15000");
        BuyerSegment segment = suggestedSegment(values.gradeA(), values.gradeReject(), values.band());
        String defectsJson = writeJson(values.defects());

        ProductGrading grading = ProductGrading.builder()
                .id(scanId)
                .farmer(farmer)
                .produceType(crop)
                .crateCount(crateCount)
                .estWeightKg(BigDecimal.valueOf(crateCount * 15L))
                .gradeA(values.gradeA())
                .gradeB(values.gradeB())
                .gradeReject(values.gradeReject())
                .shelfLifeBand(values.band())
                .approxDays(values.approxDays())
                .shelfLifeBasis(values.basis())
                .defectsJson(defectsJson)
                .suggestedUnitPrice(suggestedPrice)
                .rubricVersion(crop.equals("tomato") ? "tomato-codex-cxs293-v1" : "banana-codex-cxs205-v1")
                .modelConfidence(values.confidence())
                .photoUrl(photoUrl)
                .suggestedSegment(segment)
                .build();
        grading.setSignature(signIfAvailable(grading));
        gradingRepository.save(grading);
        return new GradingOutcome(toResponse(grading), attempt.source(), attempt.cacheUsed());
    }

    public GradingResultResponse toResponse(ProductGrading grading) {
        return new GradingResultResponse(
                grading.getId(),
                grading.getProduceType(),
                grading.getCrateCount(),
                grading.getEstWeightKg(),
                new GradingResultResponse.GradeDistribution(grading.getGradeA(), grading.getGradeB(), grading.getGradeReject()),
                new GradingResultResponse.ShelfLifeEstimate(
                        grading.getShelfLifeBand().name().toLowerCase(Locale.ROOT),
                        grading.getApproxDays(),
                        grading.getShelfLifeBasis()
                ),
                readDefects(grading.getDefectsJson()),
                grading.getSuggestedUnitPrice(),
                grading.getRubricVersion(),
                grading.getModelConfidence(),
                grading.getPhotoUrl(),
                grading.getIpfsCid(),
                grading.getSignature()
        );
    }

    private BuyerSegment suggestedSegment(BigDecimal gradeA, BigDecimal reject, ShelfLifeBand band) {
        if (band == ShelfLifeBand.SHORT || reject.compareTo(new BigDecimal("0.15")) >= 0) {
            return BuyerSegment.PROCESSING;
        }
        if (gradeA.compareTo(new BigDecimal("0.65")) >= 0 && band != ShelfLifeBand.SHORT) {
            return BuyerSegment.RETAIL;
        }
        return BuyerSegment.WHOLESALE;
    }

    private GradingAttempt gradingAttempt(MultipartFile photo, String crop) {
        if ("rehearsal".equalsIgnoreCase(gradingMode)) {
            return new GradingAttempt(rehearsalValues(crop), "rehearsal-cache", true);
        }
        if (!"openrouter".equalsIgnoreCase(gradingMode)) {
            throw new IllegalStateException("GRADING_MODE must be rehearsal or openrouter");
        }
        if (!openRouterClient.isConfigured()) {
            throw new IllegalStateException("OpenRouter is not configured; set OPENROUTER_API_KEY");
        }
        try {
            return new GradingAttempt(liveValues(openRouterClient.grade(photo, crop), crop), "openrouter", false);
        } catch (OpenRouterGradingException exception) {
            logger.warn("OpenRouter grading failed; using disclosed rehearsal cache: {}", exception.getMessage());
            return new GradingAttempt(rehearsalValues(crop), "rehearsal-cache", true);
        }
    }

    private GradingValues liveValues(VlmGradingResult result, String crop) {
        if (!result.imageUsable()) {
            throw new IllegalArgumentException("Photo is not clear enough for visual grading; retake it with the full crate visible");
        }
        if (!result.matchesDeclaredProduce()) {
            throw new IllegalArgumentException("Photo does not match the declared produce_type " + crop);
        }
        VlmGradingResult.GradeDistribution distribution = result.gradeDistribution();
        if (distribution == null) {
            throw new OpenRouterGradingException("OpenRouter omitted grade_distribution");
        }
        BigDecimal gradeA = requireFraction(distribution.a(), "A");
        BigDecimal gradeB = requireFraction(distribution.b(), "B");
        BigDecimal gradeReject = requireFraction(distribution.reject(), "reject");
        BigDecimal total = gradeA.add(gradeB).add(gradeReject);
        if (total.subtract(BigDecimal.ONE).abs().compareTo(new BigDecimal("0.02")) > 0) {
            throw new OpenRouterGradingException("OpenRouter grade fractions do not sum to 1");
        }
        gradeA = gradeA.divide(total, 5, RoundingMode.HALF_UP);
        gradeB = gradeB.divide(total, 5, RoundingMode.HALF_UP);
        gradeReject = BigDecimal.ONE.subtract(gradeA).subtract(gradeB).setScale(5, RoundingMode.HALF_UP);
        if (gradeReject.signum() < 0) {
            throw new OpenRouterGradingException("OpenRouter grade fractions could not be normalized");
        }

        VlmGradingResult.ShelfLifeEstimate shelfLife = result.estShelfLife();
        if (shelfLife == null) {
            throw new OpenRouterGradingException("OpenRouter omitted est_shelf_life");
        }
        ShelfLifeBand band;
        try {
            band = ShelfLifeBand.valueOf(requireText(shelfLife.band(), "shelf-life band", 16).toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new OpenRouterGradingException("OpenRouter returned an invalid shelf-life band", exception);
        }
        if (shelfLife.approxDays() < 1 || shelfLife.approxDays() > 30) {
            throw new OpenRouterGradingException("OpenRouter returned an invalid shelf-life day estimate");
        }
        String basis = requireText(shelfLife.basis(), "shelf-life basis", 500);
        List<String> defects = requireDefects(result.defectsObserved());
        String confidence = requireText(result.modelConfidence(), "model confidence", 16).toLowerCase(Locale.ROOT);
        if (!Set.of("low", "medium", "high").contains(confidence)) {
            throw new OpenRouterGradingException("OpenRouter returned an invalid confidence");
        }
        return new GradingValues(
                gradeA,
                gradeB,
                gradeReject,
                band,
                shelfLife.approxDays(),
                basis,
                defects,
                confidence
        );
    }

    private GradingValues rehearsalValues(String crop) {
        BigDecimal gradeA = crop.equals("tomato") ? new BigDecimal("0.70") : new BigDecimal("0.62");
        BigDecimal gradeB = crop.equals("tomato") ? new BigDecimal("0.25") : new BigDecimal("0.31");
        BigDecimal gradeReject = BigDecimal.ONE.subtract(gradeA).subtract(gradeB);
        int approxDays = crop.equals("tomato") ? 6 : 4;
        ShelfLifeBand band = approxDays >= 7
                ? ShelfLifeBand.LONG
                : approxDays >= 4 ? ShelfLifeBand.MEDIUM : ShelfLifeBand.SHORT;
        List<String> defects = crop.equals("tomato")
                ? List.of("minor surface bruising on visible fruit", "no visible decay")
                : List.of("minor peel spotting", "no visible rot");
        return new GradingValues(
                gradeA,
                gradeB,
                gradeReject,
                band,
                approxDays,
                "visual ripeness stage, ambient storage",
                defects,
                "high"
        );
    }

    private void validatePhoto(MultipartFile photo) {
        if (photo == null || photo.isEmpty()) {
            throw new IllegalArgumentException("photo must contain an image");
        }
        String contentType = photo.getContentType();
        if (contentType == null || !SUPPORTED_IMAGE_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("photo must be JPEG, PNG, WebP, or GIF");
        }
    }

    private BigDecimal requireFraction(BigDecimal value, String label) {
        if (value == null || value.compareTo(BigDecimal.ZERO) < 0 || value.compareTo(BigDecimal.ONE) > 0) {
            throw new OpenRouterGradingException("OpenRouter returned an invalid " + label + " grade fraction");
        }
        return value;
    }

    private String requireText(String value, String label, int maxLength) {
        if (value == null || value.isBlank() || value.length() > maxLength) {
            throw new OpenRouterGradingException("OpenRouter returned an invalid " + label);
        }
        return value.trim();
    }

    private List<String> requireDefects(List<String> defects) {
        if (defects == null || defects.isEmpty() || defects.size() > 8) {
            throw new OpenRouterGradingException("OpenRouter returned an invalid defects list");
        }
        return defects.stream()
                .map(defect -> requireText(defect, "observed defect", 240))
                .toList();
    }

    private String signIfAvailable(ProductGrading grading) {
        UserEntity farmer = grading.getFarmer();
        if (!sidecarClient.isEnabled() || farmer.getStellarSecretEnc() == null) {
            return null;
        }
        Map<String, Object> canonical = new LinkedHashMap<>();
        canonical.put("scan_id", grading.getId().toString());
        canonical.put("produce_type", grading.getProduceType());
        canonical.put("crate_count", grading.getCrateCount());
        canonical.put("est_weight_kg", grading.getEstWeightKg());
        canonical.put("grade_distribution", Map.of(
                "A", grading.getGradeA(),
                "B", grading.getGradeB(),
                "reject", grading.getGradeReject()
        ));
        canonical.put("est_shelf_life", Map.of(
                "band", grading.getShelfLifeBand().name().toLowerCase(Locale.ROOT),
                "approx_days", grading.getApproxDays(),
                "basis", grading.getShelfLifeBasis()
        ));
        canonical.put("defects_observed", readDefects(grading.getDefectsJson()));
        canonical.put("suggested_unit_price", grading.getSuggestedUnitPrice());
        canonical.put("rubric_version", grading.getRubricVersion());
        canonical.put("model_confidence", grading.getModelConfidence());
        canonical.put("photo_url", grading.getPhotoUrl());
        return sidecarClient.sign(secretCryptoService.decrypt(farmer.getStellarSecretEnc()), writeJson(canonical));
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize grading data", exception);
        }
    }

    private List<String> readDefects(String json) {
        try {
            return objectMapper.readerForListOf(String.class).readValue(json);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not deserialize grading defects", exception);
        }
    }

    public record GradingOutcome(GradingResultResponse result, String source, boolean cacheUsed) {
    }

    private record GradingAttempt(GradingValues values, String source, boolean cacheUsed) {
    }

    private record GradingValues(
            BigDecimal gradeA,
            BigDecimal gradeB,
            BigDecimal gradeReject,
            ShelfLifeBand band,
            int approxDays,
            String basis,
            List<String> defects,
            String confidence
    ) {
    }
}
