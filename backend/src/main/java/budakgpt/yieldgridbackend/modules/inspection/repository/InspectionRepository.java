package budakgpt.yieldgridbackend.modules.inspection.repository;

import budakgpt.yieldgridbackend.modules.inspection.entity.InspectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<InspectionEntity, Long> {
    // TODO: add custom query methods for Inspection
}
