package budakgpt.yieldgridbackend.modules.product.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import budakgpt.yieldgridbackend.modules.product.dto.CategoryResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ChangeStatusRequest;
import budakgpt.yieldgridbackend.modules.product.dto.CreateProductRequest;
import budakgpt.yieldgridbackend.modules.product.dto.ProductResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ProductSearchCriteria;
import budakgpt.yieldgridbackend.modules.product.dto.ProductSummaryResponse;
import budakgpt.yieldgridbackend.modules.product.dto.UpdateProductRequest;
import budakgpt.yieldgridbackend.modules.product.dto.UpdateStockRequest;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);

    ProductResponse updateProduct(UUID id, UpdateProductRequest request);

    void deleteProduct(UUID id);

    ProductResponse archiveProduct(UUID id);

    ProductResponse getProduct(UUID id);

    Page<ProductSummaryResponse> getAllProducts(Pageable pageable);

    Page<ProductSummaryResponse> getProductsBySeller(UUID sellerId, Pageable pageable);

    Page<ProductSummaryResponse> getMyProducts(Pageable pageable);

    Page<ProductSummaryResponse> searchProducts(ProductSearchCriteria criteria, Pageable pageable);

    ProductResponse updateStock(UUID id, UpdateStockRequest request);

    ProductResponse changeStatus(UUID id, ChangeStatusRequest request);

    List<CategoryResponse> getActiveCategories();
}
