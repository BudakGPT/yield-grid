package budakgpt.yieldgridbackend.modules.product.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import budakgpt.yieldgridbackend.modules.product.entity.ProductCategory;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, UUID> {
    List<ProductCategory> findByActiveTrueOrderByNameAsc();

    Optional<ProductCategory> findByNameIgnoreCase(String name);
}
