package budakgpt.yieldgridbackend.modules.grading.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import budakgpt.yieldgridbackend.common.security.CurrentUserService;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.grading.dto.VlmGradingResult;
import budakgpt.yieldgridbackend.modules.grading.entity.ProductGrading;
import budakgpt.yieldgridbackend.modules.grading.repository.ProductGradingRepository;
import budakgpt.yieldgridbackend.modules.stellar.SecretCryptoService;
import budakgpt.yieldgridbackend.modules.stellar.SidecarClient;

class GradingServiceTests {
    private final ProductGradingRepository gradingRepository = mock(ProductGradingRepository.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);
    private final UploadStorageService uploadStorageService = mock(UploadStorageService.class);
    private final SidecarClient sidecarClient = mock(SidecarClient.class);
    private final SecretCryptoService secretCryptoService = mock(SecretCryptoService.class);
    private final OpenRouterGradingClient openRouterClient = mock(OpenRouterGradingClient.class);
    private final MockMultipartFile photo = new MockMultipartFile(
            "photo",
            "crate.jpg",
            MediaType.IMAGE_JPEG_VALUE,
            "valid-image-bytes".getBytes()
    );

    @BeforeEach
    void setUp() {
        when(currentUserService.requireUser()).thenReturn(UserEntity.builder().role(Role.SELLER).build());
        when(uploadStorageService.store(any(), any())).thenReturn("/uploads/crate.jpg");
        when(openRouterClient.isConfigured()).thenReturn(true);
    }

    @Test
    void usesValidatedLiveOpenRouterResult() {
        when(openRouterClient.grade(photo, "tomato")).thenReturn(new VlmGradingResult(
                "tomato",
                true,
                true,
                new VlmGradingResult.GradeDistribution(
                        new BigDecimal("0.68"),
                        new BigDecimal("0.27"),
                        new BigDecimal("0.05")
                ),
                new VlmGradingResult.ShelfLifeEstimate(
                        "medium",
                        5,
                        "breaker-stage colour under ambient storage; visual estimate, not an expiry date"
                ),
                List.of("minor bruising on about 8% of visible fruit"),
                "high"
        ));
        GradingService service = service("openrouter");

        GradingService.GradingOutcome outcome = service.grade(photo, 3, "tomato");

        assertThat(outcome.source()).isEqualTo("openrouter");
        assertThat(outcome.cacheUsed()).isFalse();
        assertThat(outcome.result().gradeDistribution().a()).isEqualByComparingTo("0.68000");
        assertThat(outcome.result().gradeDistribution().reject()).isEqualByComparingTo("0.05000");
        assertThat(outcome.result().estShelfLife().approxDays()).isEqualTo(5);
        verify(gradingRepository).save(any(ProductGrading.class));
    }

    @Test
    void fallsBackToDisclosedRehearsalCacheWhenProviderFails() {
        when(openRouterClient.grade(photo, "tomato"))
                .thenThrow(new OpenRouterGradingException("provider unavailable"));
        GradingService service = service("openrouter");

        GradingService.GradingOutcome outcome = service.grade(photo, 3, "tomato");

        assertThat(outcome.source()).isEqualTo("rehearsal-cache");
        assertThat(outcome.cacheUsed()).isTrue();
        assertThat(outcome.result().gradeDistribution().a()).isEqualByComparingTo("0.70");
        verify(gradingRepository).save(any(ProductGrading.class));
    }

    private GradingService service(String mode) {
        return new GradingService(
                gradingRepository,
                currentUserService,
                uploadStorageService,
                sidecarClient,
                secretCryptoService,
                openRouterClient,
                mode
        );
    }
}
