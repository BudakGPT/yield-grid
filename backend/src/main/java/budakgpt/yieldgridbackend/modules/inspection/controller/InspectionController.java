package budakgpt.yieldgridbackend.modules.inspection.controller;

import budakgpt.yieldgridbackend.common.response.ApiResponse;
import budakgpt.yieldgridbackend.modules.inspection.service.InspectionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/inspection")
public class InspectionController {
    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("Inspection module ready");
    }

    @PostMapping
    public ApiResponse<String> createPlaceholder() {
        return ApiResponse.success("TODO: implement Inspection endpoint");
    }
}
