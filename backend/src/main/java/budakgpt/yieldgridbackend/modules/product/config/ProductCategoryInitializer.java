package budakgpt.yieldgridbackend.modules.product.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.modules.product.entity.ProductCategory;
import budakgpt.yieldgridbackend.modules.product.repository.ProductCategoryRepository;

@Component
public class ProductCategoryInitializer implements CommandLineRunner {

    private final ProductCategoryRepository categoryRepository;

    public ProductCategoryInitializer(ProductCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<ProductCategory> defaults = List.of(
                category("Grains", "Rice, corn, wheat, and other staple grains"),
                category("Vegetables", "Fresh vegetables and leafy produce"),
                category("Fruits", "Seasonal and tropical fruits"),
                category("Herbs", "Fresh herbs, spices, and aromatic plants"),
                category("Livestock Products", "Eggs, milk, and other livestock-derived products")
        );

        for (ProductCategory category : defaults) {
            categoryRepository.findByNameIgnoreCase(category.getName())
                    .orElseGet(() -> categoryRepository.save(category));
        }
    }

    private ProductCategory category(String name, String description) {
        return ProductCategory.builder()
                .name(name)
                .description(description)
                .active(true)
                .build();
    }
}
