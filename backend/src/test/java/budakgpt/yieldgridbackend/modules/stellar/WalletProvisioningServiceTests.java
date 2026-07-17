package budakgpt.yieldgridbackend.modules.stellar;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;

class WalletProvisioningServiceTests {
    private final SidecarClient sidecarClient = mock(SidecarClient.class);
    private final SecretCryptoService secretCryptoService = mock(SecretCryptoService.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final WalletProvisioningService service = new WalletProvisioningService(
            sidecarClient,
            secretCryptoService,
            userRepository
    );

    @Test
    void provisionsAndPersistsMissingBuyerWallet() {
        UserEntity buyer = user(Role.BUYER);
        when(sidecarClient.isEnabled()).thenReturn(true);
        when(sidecarClient.provision("buyer"))
                .thenReturn(new SidecarClient.ProvisionResponse("GBUYER", "SBUYER", "buyer", "5000000"));
        when(secretCryptoService.encrypt("SBUYER")).thenReturn("encrypted-secret");
        when(userRepository.save(buyer)).thenReturn(buyer);

        UserEntity provisioned = service.ensureProvisioned(buyer);

        assertThat(provisioned.getStellarPublicKey()).isEqualTo("GBUYER");
        assertThat(provisioned.getStellarSecretEnc()).isEqualTo("encrypted-secret");
        verify(userRepository).save(buyer);
    }

    @Test
    void leavesExistingWalletUnchanged() {
        UserEntity farmer = user(Role.SELLER);
        farmer.setStellarPublicKey("GFARMER");
        farmer.setStellarSecretEnc("encrypted-secret");

        assertThat(service.ensureProvisioned(farmer)).isSameAs(farmer);

        verify(sidecarClient, never()).provision("farmer");
        verify(userRepository, never()).save(farmer);
    }

    @Test
    void reportsUnavailableSettlementInsteadOfMissingWallet() {
        when(sidecarClient.isEnabled()).thenReturn(false);

        assertThatThrownBy(() -> service.ensureProvisioned(user(Role.BUYER)))
                .isInstanceOf(SidecarUnavailableException.class)
                .hasMessage("Payment setup is unavailable; start the settlement sidecar and enable SIDECAR_ENABLED");
    }

    private UserEntity user(Role role) {
        return UserEntity.builder()
                .id(UUID.randomUUID())
                .fullName(role.name())
                .email(role.name().toLowerCase() + "@example.com")
                .role(role)
                .enabled(true)
                .emailVerified(true)
                .build();
    }
}
