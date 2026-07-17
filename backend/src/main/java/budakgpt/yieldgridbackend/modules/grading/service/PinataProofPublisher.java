package budakgpt.yieldgridbackend.modules.grading.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.nio.file.Path;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import budakgpt.yieldgridbackend.modules.grading.entity.ProductGrading;
import budakgpt.yieldgridbackend.modules.grading.repository.ProductGradingRepository;

@Component
public class PinataProofPublisher {
    private static final Logger logger = LoggerFactory.getLogger(PinataProofPublisher.class);
    private static final int MAX_ATTEMPTS = 3;

    private final ProductGradingRepository gradingRepository;
    private final PinataClient pinataClient;
    private final UploadStorageService uploadStorageService;
    private final ObjectMapper objectMapper;

    public PinataProofPublisher(
            ProductGradingRepository gradingRepository,
            PinataClient pinataClient,
            UploadStorageService uploadStorageService
    ) {
        this.gradingRepository = gradingRepository;
        this.pinataClient = pinataClient;
        this.uploadStorageService = uploadStorageService;
        this.objectMapper = new ObjectMapper().findAndRegisterModules();
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publish(GradingPersistedEvent event) {
        if (!pinataClient.isConfigured()) {
            return;
        }
        ProductGrading grading = gradingRepository.findById(event.scanId()).orElse(null);
        if (grading == null || (grading.getIpfsCid() != null && !grading.getIpfsCid().isBlank())) {
            return;
        }
        Path photo = uploadStorageService.findStoredPhoto(grading.getId()).orElse(null);
        if (photo == null) {
            logger.error("Cannot pin grading proof {} because its stored photo is missing", grading.getId());
            return;
        }
        PinataException latest = null;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                String photoCid = pinataClient.pinFile(photo, grading.getId());
                String cid = pinataClient.pinJson(
                        proofFor(grading, photoCid),
                        grading.getId(),
                        grading.getRubricVersion(),
                        grading.getProduceType()
                );
                grading.setIpfsCid(cid);
                gradingRepository.save(grading);
                logger.info("Pinned grading proof {} to IPFS CID {}", grading.getId(), cid);
                return;
            } catch (PinataException exception) {
                latest = exception;
                logger.warn(
                        "Pinata grading proof attempt {}/{} failed for {}: {}",
                        attempt,
                        MAX_ATTEMPTS,
                        grading.getId(),
                        exception.getMessage()
                );
            }
        }
        logger.error("Pinata grading proof failed after retries for {}", grading.getId(), latest);
    }

    private Map<String, Object> proofFor(ProductGrading grading, String photoCid) {
        Map<String, Object> proof = new LinkedHashMap<>();
        proof.put("scan_id", grading.getId().toString());
        proof.put("produce_type", grading.getProduceType());
        proof.put("crate_count", grading.getCrateCount());
        proof.put("est_weight_kg", grading.getEstWeightKg());
        proof.put("grade_distribution", Map.of(
                "A", grading.getGradeA(),
                "B", grading.getGradeB(),
                "reject", grading.getGradeReject()
        ));
        proof.put("est_shelf_life", Map.of(
                "band", grading.getShelfLifeBand().name().toLowerCase(),
                "approx_days", grading.getApproxDays(),
                "basis", grading.getShelfLifeBasis()
        ));
        proof.put("defects_observed", defects(grading.getDefectsJson()));
        proof.put("rubric_version", grading.getRubricVersion());
        proof.put("model_confidence", grading.getModelConfidence());
        proof.put("photo", Map.of(
                "cid", photoCid,
                "uri", "ipfs://" + photoCid,
                "source_url", grading.getPhotoUrl()
        ));
        proof.put("signature", grading.getSignature());
        proof.put("created_at", grading.getCreatedAt() == null ? null : grading.getCreatedAt().toString());
        return proof;
    }

    private List<String> defects(String defectsJson) {
        try {
            return objectMapper.readValue(defectsJson, new TypeReference<>() {
            });
        } catch (Exception exception) {
            throw new PinataException("Stored grading defects are invalid", exception);
        }
    }
}
