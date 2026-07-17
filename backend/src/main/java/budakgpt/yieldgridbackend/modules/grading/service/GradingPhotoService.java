package budakgpt.yieldgridbackend.modules.grading.service;

import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.modules.grading.entity.ProductGrading;
import budakgpt.yieldgridbackend.modules.grading.repository.ProductGradingRepository;

@Service
public class GradingPhotoService {
    private final ProductGradingRepository gradingRepository;
    private final UploadStorageService uploadStorageService;
    private final PinataClient pinataClient;

    public GradingPhotoService(
            ProductGradingRepository gradingRepository,
            UploadStorageService uploadStorageService,
            PinataClient pinataClient
    ) {
        this.gradingRepository = gradingRepository;
        this.uploadStorageService = uploadStorageService;
        this.pinataClient = pinataClient;
    }

    public Optional<Path> localPhoto(UUID scanId) {
        return uploadStorageService.findStoredPhoto(scanId);
    }

    @Transactional
    public Optional<String> persistentPhotoUrl(UUID scanId) {
        ProductGrading grading = gradingRepository.findById(scanId).orElse(null);
        if (grading == null) {
            return Optional.empty();
        }
        String photoCid = grading.getPhotoIpfsCid();
        if ((photoCid == null || photoCid.isBlank()) && grading.getIpfsCid() != null && !grading.getIpfsCid().isBlank()) {
            photoCid = pinataClient.photoCidFromProof(grading.getIpfsCid());
            grading.setPhotoIpfsCid(photoCid);
            gradingRepository.save(grading);
        }
        return photoCid == null || photoCid.isBlank()
                ? Optional.empty()
                : Optional.of(pinataClient.gatewayUrl(photoCid));
    }
}
