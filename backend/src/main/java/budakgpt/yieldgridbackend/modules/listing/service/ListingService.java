package budakgpt.yieldgridbackend.modules.listing.service;

import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.common.security.CurrentUserService;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.grading.dto.GradingResultResponse;
import budakgpt.yieldgridbackend.modules.grading.entity.ProductGrading;
import budakgpt.yieldgridbackend.modules.grading.enums.BuyerSegment;
import budakgpt.yieldgridbackend.modules.grading.repository.ProductGradingRepository;
import budakgpt.yieldgridbackend.modules.listing.dto.CreateListingRequest;
import budakgpt.yieldgridbackend.modules.listing.dto.ListingResponse;
import budakgpt.yieldgridbackend.modules.product.entity.Product;
import budakgpt.yieldgridbackend.modules.product.entity.ProductCategory;
import budakgpt.yieldgridbackend.modules.product.entity.ProductImage;
import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.enums.QualityGrade;
import budakgpt.yieldgridbackend.modules.product.enums.Unit;
import budakgpt.yieldgridbackend.modules.product.repository.ProductCategoryRepository;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;
import budakgpt.yieldgridbackend.modules.ws.YieldGridEventPublisher;

@Service
public class ListingService {
    private final ProductGradingRepository gradingRepository;
    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final CurrentUserService currentUserService;
    private final YieldGridEventPublisher eventPublisher;

    public ListingService(
            ProductGradingRepository gradingRepository,
            ProductRepository productRepository,
            ProductCategoryRepository categoryRepository,
            CurrentUserService currentUserService,
            YieldGridEventPublisher eventPublisher
    ) {
        this.gradingRepository = gradingRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.currentUserService = currentUserService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ListingResponse create(CreateListingRequest request) {
        UserEntity farmer = currentUserService.requireUser();
        ProductGrading grading = gradingRepository.findByIdAndFarmerId(request.scanId(), farmer.getId())
                .orElseThrow(() -> new IllegalArgumentException("Scan not found or does not belong to this farmer"));
        if (grading.getProduct() != null) {
            throw new IllegalArgumentException("This scan is already listed");
        }
        String categoryName = grading.getProduceType().equals("banana") ? "Fruits" : "Vegetables";
        ProductCategory category = categoryRepository.findByNameIgnoreCase(categoryName)
                .orElseThrow(() -> new IllegalStateException("Default product category is missing"));
        Product product = Product.builder()
                .seller(farmer)
                .category(category)
                .name(capitalize(grading.getProduceType()) + " crate")
                .description("Codex visual grade " + grading.getRubricVersion())
                .price(request.unitPrice())
                .stock(grading.getEstWeightKg().setScale(0, RoundingMode.DOWN).intValueExact())
                .qualityGrade(toQualityGrade(grading))
                .unit(Unit.KG)
                .originProvince("West Java")
                .originCity("Pangalengan")
                .status(ProductStatus.ACTIVE)
                .build();
        product.addImage(ProductImage.builder().imageUrl(grading.getPhotoUrl()).displayOrder(0).build());
        Product saved = productRepository.save(product);
        grading.setProduct(saved);
        gradingRepository.save(grading);
        ListingResponse response = toResponse(grading);
        eventPublisher.publish("listing.created", saved.getId(), response);
        return response;
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> findOpen(BuyerSegment segment) {
        return gradingRepository.findByProductIsNotNullOrderByCreatedAtDesc().stream()
                .filter(grading -> grading.getProduct().getStatus() == ProductStatus.ACTIVE)
                .filter(grading -> segment == null || grading.getSuggestedSegment() == segment)
                .map(this::toResponse)
                .toList();
    }

    public ListingResponse toResponse(ProductGrading grading) {
        Product product = grading.getProduct();
        return new ListingResponse(
                product.getId(),
                grading.getId(),
                grading.getFarmer().getId(),
                grading.getFarmer().getFullName(),
                grading.getProduceType(),
                product.getPrice(),
                grading.getEstWeightKg(),
                new GradingResultResponse.GradeDistribution(grading.getGradeA(), grading.getGradeB(), grading.getGradeReject()),
                new GradingResultResponse.ShelfLifeEstimate(
                        grading.getShelfLifeBand().name().toLowerCase(Locale.ROOT),
                        grading.getApproxDays(),
                        grading.getShelfLifeBasis()
                ),
                grading.getPhotoUrl(),
                grading.getIpfsCid(),
                grading.getRubricVersion(),
                grading.getSuggestedSegment().name().toLowerCase(Locale.ROOT),
                product.getStatus() == ProductStatus.ACTIVE ? "open" : product.getStatus().name().toLowerCase(Locale.ROOT)
        );
    }

    private QualityGrade toQualityGrade(ProductGrading grading) {
        if (grading.getGradeA().doubleValue() >= 0.65) {
            return QualityGrade.GRADE_A;
        }
        if (grading.getGradeB().doubleValue() >= 0.50) {
            return QualityGrade.GRADE_B;
        }
        return QualityGrade.GRADE_C;
    }

    private String capitalize(String value) {
        return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1);
    }
}
