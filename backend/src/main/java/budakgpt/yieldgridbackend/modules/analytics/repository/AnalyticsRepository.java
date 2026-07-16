package budakgpt.yieldgridbackend.modules.analytics.repository;

import budakgpt.yieldgridbackend.modules.analytics.entity.AnalyticsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalyticsRepository extends JpaRepository<AnalyticsEntity, Long> {
    // TODO: add custom query methods for Analytics
}
