package budakgpt.yieldgridbackend.modules.stellar;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;

@Service
public class WalletProvisioningService {
    private final SidecarClient sidecarClient;
    private final SecretCryptoService secretCryptoService;
    private final UserRepository userRepository;

    public WalletProvisioningService(
            SidecarClient sidecarClient,
            SecretCryptoService secretCryptoService,
            UserRepository userRepository
    ) {
        this.sidecarClient = sidecarClient;
        this.secretCryptoService = secretCryptoService;
        this.userRepository = userRepository;
    }

    @Transactional
    public UserEntity ensureProvisioned(UserEntity user) {
        if (hasWallet(user)) {
            return user;
        }
        if (!sidecarClient.isEnabled()) {
            throw new SidecarUnavailableException(
                    "Payment setup is unavailable; start the settlement sidecar and enable SIDECAR_ENABLED"
            );
        }

        SidecarClient.ProvisionResponse wallet = sidecarClient.provision(walletRole(user));
        if (wallet.publicKey() == null || wallet.publicKey().isBlank()
                || wallet.secret() == null || wallet.secret().isBlank()) {
            throw new SidecarUnavailableException("Settlement sidecar returned an invalid wallet");
        }
        user.setStellarPublicKey(wallet.publicKey());
        user.setStellarSecretEnc(secretCryptoService.encrypt(wallet.secret()));
        return userRepository.save(user);
    }

    private boolean hasWallet(UserEntity user) {
        return user != null
                && user.getStellarPublicKey() != null
                && !user.getStellarPublicKey().isBlank()
                && user.getStellarSecretEnc() != null
                && !user.getStellarSecretEnc().isBlank();
    }

    private String walletRole(UserEntity user) {
        if (user.getRole() == Role.BUYER) {
            return "buyer";
        }
        if (user.getRole() == Role.SELLER) {
            return "farmer";
        }
        throw new IllegalArgumentException("Only buyer and farmer accounts can provision payment wallets");
    }
}
