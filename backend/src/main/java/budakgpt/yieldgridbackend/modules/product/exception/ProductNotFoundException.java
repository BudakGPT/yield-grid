package budakgpt.yieldgridbackend.modules.product.exception;

import java.util.UUID;

public class ProductNotFoundException extends ProductException {
    public ProductNotFoundException(UUID id) {
        super("Product with id '%s' was not found".formatted(id));
    }
}
