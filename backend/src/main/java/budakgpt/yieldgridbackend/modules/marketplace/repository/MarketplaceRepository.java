package budakgpt.yieldgridbackend.modules.marketplace.repository;

import budakgpt.yieldgridbackend.modules.marketplace.entity.MarketplaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketplaceRepository extends JpaRepository<MarketplaceEntity, Long> {
    // TODO: add custom query methods for Marketplace
}
