package budakgpt.yieldgridbackend.modules.farmer.repository;

import budakgpt.yieldgridbackend.modules.farmer.entity.FarmerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FarmerRepository extends JpaRepository<FarmerEntity, Long> {
    // TODO: add custom query methods for Farmer
}
