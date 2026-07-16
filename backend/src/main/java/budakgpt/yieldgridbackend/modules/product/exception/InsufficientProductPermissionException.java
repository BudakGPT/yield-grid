package budakgpt.yieldgridbackend.modules.product.exception;

public class InsufficientProductPermissionException extends ProductException {
    public InsufficientProductPermissionException(String message) {
        super(message);
    }
}
