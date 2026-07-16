package budakgpt.yieldgridbackend.modules.product.mapper;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Component;

import budakgpt.yieldgridbackend.modules.product.dto.CategoryResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ProductImageResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ProductResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ProductSummaryResponse;
import budakgpt.yieldgridbackend.modules.product.entity.Product;
import budakgpt.yieldgridbackend.modules.product.entity.ProductCategory;
import budakgpt.yieldgridbackend.modules.product.entity.ProductImage;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSeller().getId(),
                product.getSeller().getFullName(),
                toCategoryResponse(product.getCategory()),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getQualityGrade(),
                product.getUnit(),
                product.getOriginProvince(),
                product.getOriginCity(),
                product.getHarvestDate(),
                product.getExpirationDate(),
                product.getStatus(),
                toImageResponses(product.getImages()),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    public ProductSummaryResponse toSummaryResponse(Product product) {
        String primaryImageUrl = product.getImages().stream()
                .min(Comparator.comparing(ProductImage::getDisplayOrder))
                .map(ProductImage::getImageUrl)
                .orElse(null);

        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getStock(),
                product.getQualityGrade(),
                product.getUnit(),
                product.getStatus(),
                toCategoryResponse(product.getCategory()),
                primaryImageUrl,
                product.getSeller().getId(),
                product.getSeller().getFullName()
        );
    }

    public CategoryResponse toCategoryResponse(ProductCategory category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription(), category.getActive());
    }

    private List<ProductImageResponse> toImageResponses(List<ProductImage> images) {
        return images.stream()
                .sorted(Comparator.comparing(ProductImage::getDisplayOrder))
                .map(image -> new ProductImageResponse(image.getId(), image.getImageUrl(), image.getDisplayOrder()))
                .toList();
    }
}
