package budakgpt.yieldgridbackend.modules.grading.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import budakgpt.yieldgridbackend.modules.grading.entity.ProductGrading;

public interface ProductGradingRepository extends JpaRepository<ProductGrading, UUID> {
    @EntityGraph(attributePaths = {"farmer", "product"})
    Optional<ProductGrading> findByIdAndFarmerId(UUID id, UUID farmerId);

    @EntityGraph(attributePaths = {"farmer", "product"})
    Optional<ProductGrading> findByProductId(UUID productId);

    @EntityGraph(attributePaths = {"farmer", "product"})
    List<ProductGrading> findByProductIsNotNullOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"farmer", "product"})
    List<ProductGrading> findByFarmerIdAndProductIsNotNullOrderByCreatedAtDesc(UUID farmerId);
}
