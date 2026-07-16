package budakgpt.yieldgridbackend.modules.grading.service;

public class OpenRouterGradingException extends RuntimeException {
    public OpenRouterGradingException(String message) {
        super(message);
    }

    public OpenRouterGradingException(String message, Throwable cause) {
        super(message, cause);
    }
}
