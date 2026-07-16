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
        return ResponseEntity.ok()
                .header(HttpHeaders.WARNING, "299 YieldGrid \"Rehearsal grading cache used\"")
                .header("X-YieldGrid-Grading-Source", "rehearsal-cache")
                .body(gradingService.grade(photo, crateCount, produceType));
    }
}
