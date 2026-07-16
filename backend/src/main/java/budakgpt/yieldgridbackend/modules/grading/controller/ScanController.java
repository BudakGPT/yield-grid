package budakgpt.yieldgridbackend.modules.grading.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import budakgpt.yieldgridbackend.modules.grading.dto.GradingResultResponse;
import budakgpt.yieldgridbackend.modules.grading.service.GradingService;
import budakgpt.yieldgridbackend.modules.grading.service.GradingService.GradingOutcome;

@RestController
@RequestMapping("/api/scans")
public class ScanController {
    private final GradingService gradingService;

    public ScanController(GradingService gradingService) {
        this.gradingService = gradingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<GradingResultResponse> scan(
            @RequestPart("photo") MultipartFile photo,
            @RequestParam("crate_count") int crateCount,
            @RequestParam("produce_type") String produceType
    ) {
        GradingOutcome outcome = gradingService.grade(photo, crateCount, produceType);
        ResponseEntity.BodyBuilder response = ResponseEntity.ok()
                .header("X-YieldGrid-Grading-Source", outcome.source());
        if (outcome.cacheUsed()) {
            response.header(HttpHeaders.WARNING, "299 YieldGrid \"Rehearsal grading cache used\"");
        }
        return response.body(outcome.result());
    }
}
