package budakgpt.yieldgridbackend.common.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import budakgpt.yieldgridbackend.common.response.ErrorResponse;
import budakgpt.yieldgridbackend.modules.auth.exception.InvalidCredentialsException;
import budakgpt.yieldgridbackend.modules.auth.exception.PrivilegedRoleRegistrationException;
import budakgpt.yieldgridbackend.modules.auth.exception.UserAlreadyExistsException;
import budakgpt.yieldgridbackend.modules.auth.exception.SupabaseAuthException;
import budakgpt.yieldgridbackend.modules.cart.exception.CartItemNotFoundException;
import budakgpt.yieldgridbackend.modules.cart.exception.CartNotFoundException;
import budakgpt.yieldgridbackend.modules.cart.exception.EmptyCartCheckoutException;
import budakgpt.yieldgridbackend.modules.cart.exception.UnauthorizedCartAccessException;
import budakgpt.yieldgridbackend.modules.demo.exception.ActiveEscrowResetException;
import budakgpt.yieldgridbackend.modules.order.exception.InsufficientStockException;
import budakgpt.yieldgridbackend.modules.order.exception.InvalidOrderRequestException;
import budakgpt.yieldgridbackend.modules.order.exception.InvalidOrderStatusTransitionException;
import budakgpt.yieldgridbackend.modules.order.exception.OrderNotFoundException;
import budakgpt.yieldgridbackend.modules.order.exception.ProductInactiveException;
import budakgpt.yieldgridbackend.modules.order.exception.UnauthorizedOrderAccessException;
import budakgpt.yieldgridbackend.modules.product.exception.CategoryNotFoundException;
import budakgpt.yieldgridbackend.modules.product.exception.InsufficientProductPermissionException;
import budakgpt.yieldgridbackend.modules.product.exception.InvalidProductStatusTransitionException;
import budakgpt.yieldgridbackend.modules.product.exception.ProductNotFoundException;
import budakgpt.yieldgridbackend.modules.product.exception.UnauthorizedProductAccessException;
import budakgpt.yieldgridbackend.modules.stellar.SidecarUnavailableException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            IllegalArgumentException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            NoResourceFoundException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.NOT_FOUND, "Endpoint not found", request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotAllowed(
            HttpRequestMethodNotSupportedException exception,
            HttpServletRequest request
    ) {
        String message = "Request method '%s' is not supported for this endpoint"
                .formatted(exception.getMethod());
        return error(HttpStatus.METHOD_NOT_ALLOWED, message, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableMessage(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.BAD_REQUEST, "Request body is missing, malformed, or contains an invalid value", request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> validationErrors = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            validationErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        HttpStatus status = HttpStatus.BAD_REQUEST;
        ErrorResponse response = ErrorResponse.validation(
                status.value(),
                status.getReasonPhrase(),
                "Validation failed",
                request.getRequestURI(),
                validationErrors
        );
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(
            UserAlreadyExistsException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.CONFLICT, exception.getMessage(), request);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.UNAUTHORIZED, exception.getMessage(), request);
    }

    @ExceptionHandler(PrivilegedRoleRegistrationException.class)
    public ResponseEntity<ErrorResponse> handlePrivilegedRoleRegistration(
            PrivilegedRoleRegistrationException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.FORBIDDEN, exception.getMessage(), request);
    }

    @ExceptionHandler(SupabaseAuthException.class)
    public ResponseEntity<ErrorResponse> handleSupabaseAuth(
            SupabaseAuthException exception,
            HttpServletRequest request
    ) {
        logger.warn("Supabase Auth request failed: {}", exception.getMessage());
        return error(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage(), request);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtException(JwtException exception, HttpServletRequest request) {
        return error(HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token", request);
    }

    @ExceptionHandler({ProductNotFoundException.class, CategoryNotFoundException.class})
    public ResponseEntity<ErrorResponse> handleProductNotFound(RuntimeException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler({CartNotFoundException.class, CartItemNotFoundException.class})
    public ResponseEntity<ErrorResponse> handleCartNotFound(RuntimeException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(UnauthorizedCartAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedCartAccess(
            UnauthorizedCartAccessException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.FORBIDDEN, exception.getMessage(), request);
    }

    @ExceptionHandler(EmptyCartCheckoutException.class)
    public ResponseEntity<ErrorResponse> handleEmptyCartCheckout(
            EmptyCartCheckoutException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler(UnauthorizedProductAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedProductAccess(
            UnauthorizedProductAccessException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.FORBIDDEN, exception.getMessage(), request);
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAuthorizationDenied(
            AuthorizationDeniedException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.FORBIDDEN, "Access is denied", request);
    }

    @ExceptionHandler(InsufficientProductPermissionException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientProductPermission(
            InsufficientProductPermissionException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.FORBIDDEN, exception.getMessage(), request);
    }

    @ExceptionHandler(InvalidProductStatusTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidStatusTransition(
            InvalidProductStatusTransitionException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleOrderNotFound(OrderNotFoundException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(UnauthorizedOrderAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedOrderAccess(
            UnauthorizedOrderAccessException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.FORBIDDEN, exception.getMessage(), request);
    }

    @ExceptionHandler({
            InvalidOrderRequestException.class,
            InvalidOrderStatusTransitionException.class,
            ProductInactiveException.class,
            InsufficientStockException.class
    })
    public ResponseEntity<ErrorResponse> handleOrderBadRequest(RuntimeException exception, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception exception, HttpServletRequest request) {
        logger.error("Unexpected application error", exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request);
    }

    @ExceptionHandler(ActiveEscrowResetException.class)
    public ResponseEntity<ErrorResponse> handleActiveEscrowReset(
            ActiveEscrowResetException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.CONFLICT, exception.getMessage(), request);
    }

    @ExceptionHandler(SidecarUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleSidecarUnavailable(
            SidecarUnavailableException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage(), request);
    }

    private ResponseEntity<ErrorResponse> error(HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status)
                .body(ErrorResponse.of(
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        request.getRequestURI()
                ));
    }
}
