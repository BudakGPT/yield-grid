package budakgpt.yieldgridbackend.modules.product.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.product.dto.CategoryResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ChangeStatusRequest;
import budakgpt.yieldgridbackend.modules.product.dto.CreateProductRequest;
import budakgpt.yieldgridbackend.modules.product.dto.ProductResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ProductSearchCriteria;
import budakgpt.yieldgridbackend.modules.product.dto.ProductSummaryResponse;
import budakgpt.yieldgridbackend.modules.product.dto.UpdateProductRequest;
import budakgpt.yieldgridbackend.modules.product.dto.UpdateStockRequest;
import budakgpt.yieldgridbackend.modules.product.entity.Product;
import budakgpt.yieldgridbackend.modules.product.entity.ProductCategory;
import budakgpt.yieldgridbackend.modules.product.entity.ProductImage;
import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.exception.CategoryNotFoundException;
import budakgpt.yieldgridbackend.modules.product.exception.InsufficientProductPermissionException;
import budakgpt.yieldgridbackend.modules.product.exception.InvalidProductStatusTransitionException;
import budakgpt.yieldgridbackend.modules.product.exception.ProductNotFoundException;
import budakgpt.yieldgridbackend.modules.product.exception.UnauthorizedProductAccessException;
import budakgpt.yieldgridbackend.modules.product.mapper.ProductMapper;
import budakgpt.yieldgridbackend.modules.product.repository.ProductCategoryRepository;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;
import budakgpt.yieldgridbackend.modules.product.service.ProductService;
import budakgpt.yieldgridbackend.modules.product.specification.ProductSpecification;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(
            ProductRepository productRepository,
            ProductCategoryRepository categoryRepository,
            UserRepository userRepository,
            ProductMapper productMapper
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.productMapper = productMapper;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        UserEntity currentUser = currentUser();
        if (currentUser.getRole() != Role.SELLER) {
            throw new InsufficientProductPermissionException("Only sellers can create products");
        }

        ProductCategory category = findActiveCategory(request.categoryId());
        Product product = Product.builder()
                .seller(currentUser)
                .category(category)
                .name(request.name().trim())
                .description(trimToNull(request.description()))
                .price(request.price())
                .stock(request.stock())
                .qualityGrade(request.qualityGrade())
                .unit(request.unit())
                .originProvince(trimToNull(request.originProvince()))
                .originCity(trimToNull(request.originCity()))
                .harvestDate(request.harvestDate())
                .expirationDate(request.expirationDate())
                .status(request.stock() == 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE)
                .build();
        product.replaceImages(buildImages(request.imageUrls()));

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(UUID id, UpdateProductRequest request) {
        Product product = findProduct(id);
        assertCanManage(product);

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new InvalidProductStatusTransitionException("Product name cannot be blank");
            }
            product.setName(request.name().trim());
        }
        if (request.description() != null) {
            product.setDescription(trimToNull(request.description()));
        }
        if (request.categoryId() != null) {
            product.setCategory(findActiveCategory(request.categoryId()));
        }
        if (request.price() != null) {
            product.setPrice(request.price());
        }
        if (request.stock() != null) {
            product.setStock(request.stock());
            if (request.stock() == 0 && product.getStatus() == ProductStatus.ACTIVE) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
        }
        if (request.qualityGrade() != null) {
            product.setQualityGrade(request.qualityGrade());
        }
        if (request.unit() != null) {
            product.setUnit(request.unit());
        }
        if (request.originProvince() != null) {
            product.setOriginProvince(trimToNull(request.originProvince()));
        }
        if (request.originCity() != null) {
            product.setOriginCity(trimToNull(request.originCity()));
        }
        if (request.harvestDate() != null) {
            product.setHarvestDate(request.harvestDate());
        }
        if (request.expirationDate() != null) {
            product.setExpirationDate(request.expirationDate());
        }
        validateDates(product);
        if (request.status() != null) {
            applyStatus(product, request.status());
        }
        if (request.imageUrls() != null) {
            product.replaceImages(buildImages(request.imageUrls()));
        }

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = findProduct(id);
        assertCanManage(product);
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public ProductResponse archiveProduct(UUID id) {
        Product product = findProduct(id);
        assertCanManage(product);
        product.setStatus(ProductStatus.ARCHIVED);
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProduct(UUID id) {
        Product product = findProduct(id);
        if (product.getStatus() == ProductStatus.ARCHIVED && !canManageAll()) {
            throw new ProductNotFoundException(id);
        }
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getAllProducts(Pageable pageable) {
        ProductSearchCriteria criteria = new ProductSearchCriteria(null, null, null, null, null, null, null, canManageAll());
        return productRepository.findAll(ProductSpecification.from(criteria), pageable)
                .map(productMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getProductsBySeller(UUID sellerId, Pageable pageable) {
        ProductSearchCriteria criteria = new ProductSearchCriteria(null, null, null, null, null, sellerId, null, canManageAll());
        return productRepository.findAll(ProductSpecification.from(criteria), pageable)
                .map(productMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getMyProducts(Pageable pageable) {
        UserEntity currentUser = currentUser();
        return productRepository.findBySeller(currentUser, pageable)
                .map(productMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> searchProducts(ProductSearchCriteria criteria, Pageable pageable) {
        ProductSearchCriteria effectiveCriteria = new ProductSearchCriteria(
                criteria.keyword(),
                criteria.category(),
                criteria.qualityGrade(),
                criteria.minimumPrice(),
                criteria.maximumPrice(),
                criteria.seller(),
                criteria.status(),
                canManageAll() && criteria.includeArchived()
        );
        return productRepository.findAll(ProductSpecification.from(effectiveCriteria), pageable)
                .map(productMapper::toSummaryResponse);
    }

    @Override
    @Transactional
    public ProductResponse updateStock(UUID id, UpdateStockRequest request) {
        Product product = findProduct(id);
        assertCanManage(product);
        product.setStock(request.stock());
        if (request.stock() == 0 && product.getStatus() == ProductStatus.ACTIVE) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (request.stock() > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse changeStatus(UUID id, ChangeStatusRequest request) {
        Product product = findProduct(id);
        assertCanManage(product);
        applyStatus(product, request.status());
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(productMapper::toCategoryResponse)
                .toList();
    }

    private Product findProduct(UUID id) {
        return productRepository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }

    private ProductCategory findActiveCategory(UUID categoryId) {
        ProductCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException(categoryId));
        if (!category.getActive()) {
            throw new CategoryNotFoundException(categoryId);
        }
        return category;
    }

    private UserEntity currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new InsufficientProductPermissionException("Authentication is required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new InsufficientProductPermissionException("Authenticated user was not found"));
    }

    private void assertCanManage(Product product) {
        UserEntity currentUser = currentUser();
        if (canManageAll(currentUser)) {
            return;
        }
        if (currentUser.getRole() == Role.SELLER && product.getSeller().getId().equals(currentUser.getId())) {
            return;
        }
        throw new UnauthorizedProductAccessException();
    }

    private boolean canManageAll() {
        return canManageAll(currentUser());
    }

    private boolean canManageAll(UserEntity user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.MODERATOR;
    }

    private void applyStatus(Product product, ProductStatus status) {
        if (status == ProductStatus.ACTIVE && product.getStock() == 0) {
            throw new InvalidProductStatusTransitionException("Product with zero stock cannot be activated");
        }
        product.setStatus(status);
    }

    private void validateDates(Product product) {
        if (product.getHarvestDate() != null
                && product.getExpirationDate() != null
                && product.getExpirationDate().isBefore(product.getHarvestDate())) {
            throw new InvalidProductStatusTransitionException("Expiration date must not be before harvest date");
        }
    }

    private List<ProductImage> buildImages(List<String> imageUrls) {
        if (imageUrls == null) {
            return List.of();
        }
        List<String> sanitizedUrls = imageUrls.stream()
                .filter(url -> url != null && !url.isBlank())
                .map(String::trim)
                .distinct()
                .toList();

        return sanitizedUrls.stream()
                .map(url -> ProductImage.builder()
                        .imageUrl(url)
                        .displayOrder(sanitizedUrls.indexOf(url))
                        .build())
                .toList();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
