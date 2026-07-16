package budakgpt.yieldgridbackend.modules.inspection.service.impl;

import budakgpt.yieldgridbackend.modules.inspection.repository.InspectionRepository;
import budakgpt.yieldgridbackend.modules.inspection.service.InspectionService;
import org.springframework.stereotype.Service;

@Service
public class InspectionServiceImpl implements InspectionService {
    private final InspectionRepository inspectionRepository;

    public InspectionServiceImpl(InspectionRepository inspectionRepository) {
        this.inspectionRepository = inspectionRepository;
    }
}
