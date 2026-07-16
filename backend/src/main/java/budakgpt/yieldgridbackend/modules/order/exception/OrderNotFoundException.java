package budakgpt.yieldgridbackend.modules.order.exception;

import java.util.UUID;

public class OrderNotFoundException extends OrderException {
    public OrderNotFoundException(UUID id) {
        super("Order with id '%s' was not found".formatted(id));
    }
}
