package budakgpt.yieldgridbackend.modules.product.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.product.entity.Product;
import budakgpt.yieldgridbackend.modules.product.entity.ProductCategory;
import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    Page<Product> findBySeller(UserEntity seller, Pageable pageable);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByCategory(ProductCategory category, Pageable pageable);

    Page<Product> findByQualityGrade(QualityGrade qualityGrade, Pageable pageable);

    long countByStatus(ProductStatus status);

    @Query("""
            select p from Product p
            where lower(p.name) like lower(concat('%', :keyword, '%'))
               or lower(coalesce(p.description, '')) like lower(concat('%', :keyword, '%'))
            """)
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
