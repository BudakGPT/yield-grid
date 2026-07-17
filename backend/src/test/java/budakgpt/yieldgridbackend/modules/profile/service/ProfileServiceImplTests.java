package budakgpt.yieldgridbackend.modules.profile.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import budakgpt.yieldgridbackend.common.security.CurrentUserService;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.profile.dto.ProfileResponse;
import budakgpt.yieldgridbackend.modules.profile.dto.UpdateProfileRequest;
import budakgpt.yieldgridbackend.modules.profile.mapper.ProfileMapper;
import budakgpt.yieldgridbackend.modules.profile.service.impl.ProfileServiceImpl;
import budakgpt.yieldgridbackend.modules.stellar.WalletProvisioningService;

class ProfileServiceImplTests {
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final WalletProvisioningService walletProvisioningService = mock(WalletProvisioningService.class);
    private final ProfileServiceImpl service = new ProfileServiceImpl(
            currentUserService,
            userRepository,
            new ProfileMapper(),
            walletProvisioningService
    );

    @Test
    void returnsAuthenticatedUserProfile() {
        UserEntity user = user();
        when(currentUserService.requireUser()).thenReturn(user);

        ProfileResponse response = service.getMyProfile();

        assertThat(response.id()).isEqualTo(user.getId());
        assertThat(response.email()).isEqualTo("farmer@example.com");
        assertThat(response.role()).isEqualTo(Role.SELLER);
        assertThat(response.walletReady()).isFalse();
    }

    @Test
    void updatesEditableFieldsAndNormalizesOptionalValues() {
        UserEntity user = user();
        when(currentUserService.requireUser()).thenReturn(user);
        when(userRepository.save(user)).thenReturn(user);

        ProfileResponse response = service.updateMyProfile(new UpdateProfileRequest(
                "  Farmer Updated  ",
                " +62 812 0000 ",
                "  Bogor, West Java ",
                "  Warehouse Receiver ",
                " +62 811 1111 ",
                " West Java ",
                " Bogor ",
                " Cibinong ",
                " 16911 ",
                " Jl. Delivery No. 1 ",
                " Call before arrival ",
                "   ",
                "https://images.example.com/farmer.jpg"
        ));

        assertThat(response.fullName()).isEqualTo("Farmer Updated");
        assertThat(response.phoneNumber()).isEqualTo("+62 812 0000");
        assertThat(response.location()).isEqualTo("Bogor, West Java");
        assertThat(response.deliveryRecipientName()).isEqualTo("Warehouse Receiver");
        assertThat(response.deliveryPhoneNumber()).isEqualTo("+62 811 1111");
        assertThat(response.deliveryCity()).isEqualTo("Bogor");
        assertThat(response.deliveryAddress()).isEqualTo("Jl. Delivery No. 1");
        assertThat(response.bio()).isNull();
        assertThat(response.avatarUrl()).isEqualTo("https://images.example.com/farmer.jpg");
        assertThat(response.email()).isEqualTo("farmer@example.com");
        assertThat(response.role()).isEqualTo(Role.SELLER);
        verify(userRepository).save(user);
    }

    private UserEntity user() {
        return UserEntity.builder()
                .id(UUID.randomUUID())
                .fullName("Farmer One")
                .email("farmer@example.com")
                .role(Role.SELLER)
                .enabled(true)
                .emailVerified(true)
                .createdAt(Instant.parse("2026-07-17T00:00:00Z"))
                .updatedAt(Instant.parse("2026-07-17T00:00:00Z"))
                .build();
    }
}
