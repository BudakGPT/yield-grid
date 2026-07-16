package budakgpt.yieldgridbackend.modules.cart.exception;

public class UnauthorizedCartAccessException extends CartException {
    public UnauthorizedCartAccessException() {
        super("You are not allowed to access this cart");
    }
}
