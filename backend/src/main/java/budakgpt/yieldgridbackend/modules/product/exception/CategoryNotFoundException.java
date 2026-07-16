package budakgpt.yieldgridbackend.modules.product.exception;

import java.util.UUID;

public class CategoryNotFoundException extends ProductException {
    public CategoryNotFoundException(UUID id) {
        super("Category with id '%s' was not found".formatted(id));
    }
}
