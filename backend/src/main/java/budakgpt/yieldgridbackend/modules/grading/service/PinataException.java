package budakgpt.yieldgridbackend.modules.grading.service;

public class PinataException extends RuntimeException {
    public PinataException(String message) {
        super(message);
    }

    public PinataException(String message, Throwable cause) {
        super(message, cause);
    }
}
