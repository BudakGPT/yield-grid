package budakgpt.yieldgridbackend.modules.settlement;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Map;

import org.springframework.stereotype.Service;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.order.entity.Order;
import budakgpt.yieldgridbackend.modules.order.enums.EscrowStatus;
import budakgpt.yieldgridbackend.modules.order.exception.InvalidOrderRequestException;
import budakgpt.yieldgridbackend.modules.stellar.SecretCryptoService;
import budakgpt.yieldgridbackend.modules.stellar.SidecarClient;
import budakgpt.yieldgridbackend.modules.ws.YieldGridEventPublisher;

@Service
public class SettlementService {
    private static final BigDecimal BASE_UNIT_FACTOR = new BigDecimal("10000000");

    private final SidecarClient sidecarClient;
    private final SecretCryptoService secretCryptoService;
    private final YieldGridEventPublisher eventPublisher;

    public SettlementService(
            SidecarClient sidecarClient,
            SecretCryptoService secretCryptoService,
            YieldGridEventPublisher eventPublisher
    ) {
        this.sidecarClient = sidecarClient;
        this.secretCryptoService = secretCryptoService;
        this.eventPublisher = eventPublisher;
    }

    public void lockEscrow(Order order) {
        UserEntity buyer = order.getBuyer();
        UserEntity farmer = order.getFarmerSeller();
        requireWallet(buyer, "buyer");
        requireWallet(farmer, "farmer");
        String txHash = sidecarClient.createEscrow(
                order.getId(),
                secretCryptoService.decrypt(buyer.getStellarSecretEnc()),
                farmer.getStellarPublicKey(),
                toBaseUnits(order.getTotalAmount()).toString()
        );
        order.setEscrowStatus(EscrowStatus.ESCROWED);
        order.setEscrowTxHash(txHash);
        eventPublisher.publish("order.escrow_locked", order.getId(), Map.of("tx_hash", txHash));
    }

    public void settle(Order order) {
        if (!java.util.Set.of(EscrowStatus.ESCROWED, EscrowStatus.IN_TRANSIT, EscrowStatus.BREACHED)
                .contains(order.getEscrowStatus())) {
            throw new InvalidOrderRequestException("Order is not ready for escrow settlement");
        }
        boolean discounted = Boolean.TRUE.equals(order.getBreachDetected());
        int discountBps = discounted ? discountForTemperature(order.getLastTemperatureC()) : 0;
        String txHash = discounted
                ? sidecarClient.settleEscrow(order.getId(), discountBps)
                : sidecarClient.confirmEscrow(order.getId());
        order.setDiscountBps(discountBps);
        order.setSettleTxHash(txHash);
        order.setEscrowStatus(EscrowStatus.SETTLED);
        eventPublisher.publish("order.settled", order.getId(), Map.of(
                "tx_hash", txHash,
                "amount", order.getTotalAmount(),
                "discounted", discounted,
                "discount_bps", discountBps
        ));
    }

    public BigInteger toBaseUnits(BigDecimal rupiah) {
        try {
            return rupiah.multiply(BASE_UNIT_FACTOR).toBigIntegerExact();
        } catch (ArithmeticException exception) {
            throw new InvalidOrderRequestException("Rupiah amount has more than 7 decimal places");
        }
    }

    private int discountForTemperature(BigDecimal temperatureC) {
        if (temperatureC == null) {
            return 1_500;
        }
        if (temperatureC.compareTo(new BigDecimal("12")) >= 0) {
            return 3_000;
        }
        if (temperatureC.compareTo(new BigDecimal("8")) >= 0) {
            return 1_500;
        }
        return 500;
    }

    private void requireWallet(UserEntity user, String label) {
        if (user == null || user.getStellarPublicKey() == null || user.getStellarSecretEnc() == null) {
            throw new InvalidOrderRequestException("The " + label + " has no provisioned Stellar wallet");
        }
    }
}
