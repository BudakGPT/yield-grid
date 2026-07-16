package budakgpt.yieldgridbackend.modules.harvest.service.impl;

import budakgpt.yieldgridbackend.modules.harvest.repository.HarvestRepository;
import budakgpt.yieldgridbackend.modules.harvest.service.HarvestService;
import org.springframework.stereotype.Service;

@Service
public class HarvestServiceImpl implements HarvestService {
    private final HarvestRepository harvestRepository;

    public HarvestServiceImpl(HarvestRepository harvestRepository) {
        this.harvestRepository = harvestRepository;
    }
}
