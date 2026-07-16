package budakgpt.yieldgridbackend.modules.grading.service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

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
import budakgpt.yieldgridbackend.modules.grading.entity.ProductGrading;
import budakgpt.yieldgridbackend.modules.grading.enums.BuyerSegment;
import budakgpt.yieldgridbackend.modules.grading.enums.ShelfLifeBand;
import budakgpt.yieldgridbackend.modules.grading.repository.ProductGradingRepository;
import budakgpt.yieldgridbackend.modules.stellar.SecretCryptoService;
import budakgpt.yieldgridbackend.modules.stellar.SidecarClient;

@Service
public class GradingService {
    private final ProductGradingRepository gradingRepository;
    private final CurrentUserService currentUserService;
    private final UploadStorageService uploadStorageService;
    private final SidecarClient sidecarClient;
    private final SecretCryptoService secretCryptoService;
    private final ObjectMapper objectMapper;
    private final String gradingMode;

    public GradingService(
            ProductGradingRepository gradingRepository,
            CurrentUserService currentUserService,
            UploadStorageService uploadStorageService,
            SidecarClient sidecarClient,
            SecretCryptoService secretCryptoService,
            @Value("${app.grading.mode:rehearsal}") String gradingMode
    ) {
        this.gradingRepository = gradingRepository;
        this.currentUserService = currentUserService;
        this.uploadStorageService = uploadStorageService;
        this.sidecarClient = sidecarClient;
        this.secretCryptoService = secretCryptoService;
        this.objectMapper = new ObjectMapper().findAndRegisterModules();
        this.gradingMode = gradingMode;
    }

    @Transactional
    public GradingResultResponse grade(MultipartFile photo, int crateCount, String produceType) {
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
        if (!"rehearsal".equalsIgnoreCase(gradingMode)) {
            throw new IllegalStateException("No live VLM provider is configured");
        }

        UUID scanId = UUID.randomUUID();
        String photoUrl = uploadStorageService.store(photo, scanId);
        BigDecimal gradeA = crop.equals("tomato") ? new BigDecimal("0.70") : new BigDecimal("0.62");
        BigDecimal gradeB = crop.equals("tomato") ? new BigDecimal("0.25") : new BigDecimal("0.31");
        BigDecimal gradeReject = BigDecimal.ONE.subtract(gradeA).subtract(gradeB);
        int approxDays = crop.equals("tomato") ? 6 : 4;
        ShelfLifeBand band = approxDays >= 7 ? ShelfLifeBand.LONG : approxDays >= 4 ? ShelfLifeBand.MEDIUM : ShelfLifeBand.SHORT;
        List<String> defects = crop.equals("tomato")
                ? List.of("minor surface bruising on visible fruit", "no visible decay")
                : List.of("minor peel spotting", "no visible rot");
        BigDecimal suggestedPrice = crop.equals("tomato") ? new BigDecimal("18000") : new BigDecimal("15000");
        BuyerSegment segment = suggestedSegment(gradeA, gradeReject, band);
        String defectsJson = writeJson(defects);

        ProductGrading grading = ProductGrading.builder()
                .id(scanId)
                .farmer(farmer)
                .produceType(crop)
                .crateCount(crateCount)
                .estWeightKg(BigDecimal.valueOf(crateCount * 15L))
                .gradeA(gradeA)
                .gradeB(gradeB)
                .gradeReject(gradeReject)
                .shelfLifeBand(band)
                .approxDays(approxDays)
                .shelfLifeBasis("visual ripeness stage, ambient storage")
                .defectsJson(defectsJson)
                .suggestedUnitPrice(suggestedPrice)
                .rubricVersion(crop.equals("tomato") ? "tomato-codex-cxs293-v1" : "banana-codex-cxs205-v1")
                .modelConfidence("high")
                .photoUrl(photoUrl)
                .suggestedSegment(segment)
                .build();
        grading.setSignature(signIfAvailable(grading));
        gradingRepository.save(grading);
        return toResponse(grading);
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
}
