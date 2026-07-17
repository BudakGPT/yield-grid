package budakgpt.yieldgridbackend.modules.grading.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import budakgpt.yieldgridbackend.modules.grading.entity.ProductGrading;
import budakgpt.yieldgridbackend.modules.grading.enums.BuyerSegment;
import budakgpt.yieldgridbackend.modules.grading.enums.ShelfLifeBand;
import budakgpt.yieldgridbackend.modules.grading.repository.ProductGradingRepository;

class PinataProofPublisherTests {
    private final ProductGradingRepository gradingRepository = mock(ProductGradingRepository.class);
    private final PinataClient pinataClient = mock(PinataClient.class);
    private final UploadStorageService uploadStorageService = mock(UploadStorageService.class);
    private final PinataProofPublisher publisher = new PinataProofPublisher(
            gradingRepository,
            pinataClient,
            uploadStorageService
    );

    @Test
    void retriesAndPersistsIpfsCid() {
        UUID scanId = UUID.randomUUID();
        ProductGrading grading = ProductGrading.builder()
                .id(scanId)
                .produceType("tomato")
                .crateCount(3)
                .estWeightKg(new BigDecimal("45.00"))
                .gradeA(new BigDecimal("0.70000"))
                .gradeB(new BigDecimal("0.25000"))
                .gradeReject(new BigDecimal("0.05000"))
                .shelfLifeBand(ShelfLifeBand.MEDIUM)
                .approxDays(6)
                .shelfLifeBasis("breaker-stage colour; visual estimate")
                .defectsJson("[\"minor bruising\"]")
                .rubricVersion("tomato-codex-cxs293-v1")
                .modelConfidence("high")
                .photoUrl("http://localhost:8083/uploads/crate.jpg")
                .suggestedSegment(BuyerSegment.RETAIL)
                .build();
        when(pinataClient.isConfigured()).thenReturn(true);
        when(gradingRepository.findById(scanId)).thenReturn(Optional.of(grading));
        Path photo = Path.of("crate.jpg");
        when(uploadStorageService.findStoredPhoto(scanId)).thenReturn(Optional.of(photo));
        when(pinataClient.pinFile(photo, scanId)).thenReturn("bafy-photo");
        when(pinataClient.pinJson(any(), eq(scanId), eq(grading.getRubricVersion()), eq("tomato")))
                .thenThrow(new PinataException("temporary failure"))
                .thenReturn("bafybeigdyrzt");

        publisher.publish(new GradingPersistedEvent(scanId));

        assertThat(grading.getIpfsCid()).isEqualTo("bafybeigdyrzt");
        verify(pinataClient, times(2)).pinFile(photo, scanId);
        verify(pinataClient, times(2)).pinJson(any(), eq(scanId), eq(grading.getRubricVersion()), eq("tomato"));
        verify(gradingRepository).save(grading);
    }
}
