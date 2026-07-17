package budakgpt.yieldgridbackend.modules.grading.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import budakgpt.yieldgridbackend.modules.grading.entity.ProductGrading;

public interface ProductGradingRepository extends JpaRepository<ProductGrading, UUID> {
    Optional<ProductGrading> findByIdAndFarmerId(UUID id, UUID farmerId);

    Optional<ProductGrading> findByProductId(UUID productId);

    List<ProductGrading> findByProductIsNotNullOrderByCreatedAtDesc();

    List<ProductGrading> findByFarmerIdAndProductIsNotNullOrderByCreatedAtDesc(UUID farmerId);
}
