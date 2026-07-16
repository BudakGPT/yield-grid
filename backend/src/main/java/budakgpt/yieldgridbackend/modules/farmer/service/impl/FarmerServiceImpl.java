package budakgpt.yieldgridbackend.modules.farmer.service.impl;

import budakgpt.yieldgridbackend.modules.farmer.repository.FarmerRepository;
import budakgpt.yieldgridbackend.modules.farmer.service.FarmerService;
import org.springframework.stereotype.Service;

@Service
public class FarmerServiceImpl implements FarmerService {
    private final FarmerRepository farmerRepository;

    public FarmerServiceImpl(FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }
}
