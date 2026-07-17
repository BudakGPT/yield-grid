package budakgpt.yieldgridbackend.modules.demo.exception;

public class ActiveEscrowResetException extends RuntimeException {
    public ActiveEscrowResetException() {
        super("Cannot reset while escrow is active on-chain; settle or refund every active order before resetting");
    }
}
