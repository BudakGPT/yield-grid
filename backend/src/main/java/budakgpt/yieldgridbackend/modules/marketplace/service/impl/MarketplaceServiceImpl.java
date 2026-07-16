package budakgpt.yieldgridbackend.modules.marketplace.service.impl;

import budakgpt.yieldgridbackend.modules.marketplace.repository.MarketplaceRepository;
import budakgpt.yieldgridbackend.modules.marketplace.service.MarketplaceService;
import org.springframework.stereotype.Service;

@Service
public class MarketplaceServiceImpl implements MarketplaceService {
    private final MarketplaceRepository marketplaceRepository;

    public MarketplaceServiceImpl(MarketplaceRepository marketplaceRepository) {
        this.marketplaceRepository = marketplaceRepository;
    }
}
