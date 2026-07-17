package budakgpt.yieldgridbackend.modules.grading.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
public class UploadStorageService {
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif",
            "image/heic", ".heic"
    );

    private final Path uploadDirectory;

    public UploadStorageService(@Value("${app.storage.upload-dir:uploads}") String uploadDir) {
        this.uploadDirectory = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public String store(MultipartFile photo, UUID scanId) {
        if (photo.isEmpty() || !EXTENSIONS.containsKey(photo.getContentType())) {
            throw new IllegalArgumentException("photo must be a non-empty JPEG, PNG, WebP, or HEIC image");
        }
        try {
            Files.createDirectories(uploadDirectory);
            String fileName = scanId + EXTENSIONS.get(photo.getContentType());
            Files.copy(photo.getInputStream(), uploadDirectory.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            return publicUrl(scanId);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not store the scan photo", exception);
        }
    }

    public String publicUrl(UUID scanId) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/scans/")
                .path(scanId.toString())
                .path("/photo")
                .toUriString();
    }

    public Optional<Path> findStoredPhoto(UUID scanId) {
        return EXTENSIONS.values().stream()
                .map(extension -> uploadDirectory.resolve(scanId + extension))
                .filter(Files::isRegularFile)
                .findFirst();
    }
}
