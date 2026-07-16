package budakgpt.yieldgridbackend.modules.product.specification;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;

import budakgpt.yieldgridbackend.modules.product.dto.ProductSearchCriteria;
import budakgpt.yieldgridbackend.modules.product.entity.Product;
import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;

public final class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> from(ProductSearchCriteria criteria) {
        return Specification.where(keyword(criteria.keyword()))
                .and(category(criteria.category()))
                .and(qualityGrade(criteria.qualityGrade()))
                .and(minimumPrice(criteria.minimumPrice()))
                .and(maximumPrice(criteria.maximumPrice()))
                .and(seller(criteria.seller()))
                .and(status(criteria.status()))
                .and(visibleArchived(criteria.includeArchived()));
    }

    private static Specification<Product> keyword(String keyword) {
        return (root, query, builder) -> {
            if (keyword == null || keyword.isBlank()) {
                return builder.conjunction();
            }
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            return builder.or(
                    builder.like(builder.lower(root.get("name")), pattern),
                    builder.like(builder.lower(builder.coalesce(root.get("description"), "")), pattern)
            );
        };
    }

    private static Specification<Product> category(UUID categoryId) {
        return (root, query, builder) -> categoryId == null
                ? builder.conjunction()
                : builder.equal(root.get("category").get("id"), categoryId);
    }

    private static Specification<Product> qualityGrade(QualityGrade qualityGrade) {
        return (root, query, builder) -> qualityGrade == null
                ? builder.conjunction()
                : builder.equal(root.get("qualityGrade"), qualityGrade);
    }

    private static Specification<Product> minimumPrice(BigDecimal minimumPrice) {
        return (root, query, builder) -> minimumPrice == null
                ? builder.conjunction()
                : builder.greaterThanOrEqualTo(root.get("price"), minimumPrice);
    }

    private static Specification<Product> maximumPrice(BigDecimal maximumPrice) {
        return (root, query, builder) -> maximumPrice == null
                ? builder.conjunction()
                : builder.lessThanOrEqualTo(root.get("price"), maximumPrice);
    }

    private static Specification<Product> seller(UUID sellerId) {
        return (root, query, builder) -> sellerId == null
                ? builder.conjunction()
                : builder.equal(root.get("seller").get("id"), sellerId);
    }

    private static Specification<Product> status(ProductStatus status) {
        return (root, query, builder) -> status == null
                ? builder.conjunction()
                : builder.equal(root.get("status"), status);
    }

    private static Specification<Product> visibleArchived(boolean includeArchived) {
        return (root, query, builder) -> includeArchived
                ? builder.conjunction()
                : builder.notEqual(root.get("status"), ProductStatus.ARCHIVED);
    }
}
