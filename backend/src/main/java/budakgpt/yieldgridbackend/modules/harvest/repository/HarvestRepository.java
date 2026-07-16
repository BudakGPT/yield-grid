package budakgpt.yieldgridbackend.modules.harvest.repository;

import budakgpt.yieldgridbackend.modules.harvest.entity.HarvestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HarvestRepository extends JpaRepository<HarvestEntity, Long> {
    // TODO: add custom query methods for Harvest
}
