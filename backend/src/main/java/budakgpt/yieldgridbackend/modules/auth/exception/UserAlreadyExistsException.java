package budakgpt.yieldgridbackend.modules.auth.exception;

public class UserAlreadyExistsException extends AuthException {
    public UserAlreadyExistsException(String email) {
        super("User with email '%s' already exists".formatted(email));
    }
}
