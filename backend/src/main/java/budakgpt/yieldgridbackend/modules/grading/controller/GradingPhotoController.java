package budakgpt.yieldgridbackend.modules.grading.controller;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import budakgpt.yieldgridbackend.modules.grading.service.GradingPhotoService;

@RestController
@RequestMapping("/api/scans")
public class GradingPhotoController {
    private final GradingPhotoService photoService;

    public GradingPhotoController(GradingPhotoService photoService) {
        this.photoService = photoService;
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<?> photo(@PathVariable UUID id) throws IOException {
        Path local = photoService.localPhoto(id).orElse(null);
        if (local != null) {
            String detected = Files.probeContentType(local);
            MediaType contentType = detected == null
                    ? MediaType.APPLICATION_OCTET_STREAM
                    : MediaType.parseMediaType(detected);
            return ResponseEntity.ok()
                    .contentType(contentType)
                    .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
                    .body(new FileSystemResource(local));
        }
        return photoService.persistentPhotoUrl(id)
                .<ResponseEntity<?>>map(url -> ResponseEntity.status(302)
                        .location(URI.create(url))
                        .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePublic())
                        .build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
