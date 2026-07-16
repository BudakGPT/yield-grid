package budakgpt.yieldgridbackend.modules.product.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import budakgpt.yieldgridbackend.modules.product.dto.CategoryResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ChangeStatusRequest;
import budakgpt.yieldgridbackend.modules.product.dto.CreateProductRequest;
import budakgpt.yieldgridbackend.modules.product.dto.ProductResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ProductSearchCriteria;
import budakgpt.yieldgridbackend.modules.product.dto.ProductSummaryResponse;
import budakgpt.yieldgridbackend.modules.product.dto.UpdateProductRequest;
import budakgpt.yieldgridbackend.modules.product.dto.UpdateStockRequest;
import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;
import budakgpt.yieldgridbackend.modules.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping
@Tag(name = "Products", description = "Agricultural product catalog and seller product management")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/api/products")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Create a product")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @GetMapping("/api/products")
    @PreAuthorize("hasAnyRole('BUYER','SELLER','ADMIN','MODERATOR','SUPPORT')")
    @Operation(summary = "List products")
    public Page<ProductSummaryResponse> getAllProducts(Pageable pageable) {
        return productService.getAllProducts(pageable);
    }

    @GetMapping("/api/products/{id}")
    @PreAuthorize("hasAnyRole('BUYER','SELLER','ADMIN','MODERATOR','SUPPORT')")
    @Operation(summary = "Get product details")
    public ProductResponse getProduct(@PathVariable UUID id) {
        return productService.getProduct(id);
    }

    @PutMapping("/api/products/{id}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN','MODERATOR')")
    @Operation(summary = "Update a product")
    public ProductResponse updateProduct(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/api/products/{id}")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN','MODERATOR')")
    @Operation(summary = "Delete a product")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/products/{id}/archive")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN','MODERATOR')")
    @Operation(summary = "Archive a product")
    public ProductResponse archiveProduct(@PathVariable UUID id) {
        return productService.archiveProduct(id);
    }

    @PatchMapping("/api/products/{id}/stock")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN','MODERATOR')")
    @Operation(summary = "Update product stock")
    public ProductResponse updateStock(@PathVariable UUID id, @Valid @RequestBody UpdateStockRequest request) {
        return productService.updateStock(id, request);
    }

    @PatchMapping("/api/products/{id}/status")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN','MODERATOR')")
    @Operation(summary = "Change product status")
    public ProductResponse changeStatus(@PathVariable UUID id, @Valid @RequestBody ChangeStatusRequest request) {
        return productService.changeStatus(id, request);
    }

    @GetMapping("/api/products/my")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "List current seller products")
    public Page<ProductSummaryResponse> getMyProducts(Pageable pageable) {
        return productService.getMyProducts(pageable);
    }

    @GetMapping("/api/products/search")
    @PreAuthorize("hasAnyRole('BUYER','SELLER','ADMIN','MODERATOR','SUPPORT')")
    @Operation(summary = "Search and filter products")
    public Page<ProductSummaryResponse> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID category,
            @RequestParam(required = false) QualityGrade qualityGrade,
            @RequestParam(required = false) BigDecimal minimumPrice,
            @RequestParam(required = false) BigDecimal maximumPrice,
            @RequestParam(required = false) UUID seller,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "false") boolean includeArchived,
            Pageable pageable
    ) {
        ProductSearchCriteria criteria = new ProductSearchCriteria(
                keyword,
                category,
                qualityGrade,
                minimumPrice,
                maximumPrice,
                seller,
                status,
                includeArchived
        );
        return productService.searchProducts(criteria, pageable);
    }

    @GetMapping("/api/categories")
    @PreAuthorize("hasAnyRole('BUYER','SELLER','ADMIN','MODERATOR','SUPPORT')")
    @Operation(summary = "List active product categories")
    public List<CategoryResponse> getCategories() {
        return productService.getActiveCategories();
    }
}
