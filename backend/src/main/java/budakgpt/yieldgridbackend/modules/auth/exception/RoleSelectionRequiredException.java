package budakgpt.yieldgridbackend.modules.auth.exception;

public class RoleSelectionRequiredException extends AuthException {
    public RoleSelectionRequiredException() {
        super("Select whether you are a farmer or a buyer to finish creating your account");
    }
}
