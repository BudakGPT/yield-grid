package budakgpt.yieldgridbackend.modules.profile.mapper;

import org.springframework.stereotype.Component;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.profile.dto.ProfileResponse;

@Component
public class ProfileMapper {

    public ProfileResponse toResponse(UserEntity user) {
        return new ProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getLocation(),
                user.getDeliveryRecipientName(),
                user.getDeliveryPhoneNumber(),
                user.getDeliveryProvince(),
                user.getDeliveryCity(),
                user.getDeliveryDistrict(),
                user.getDeliveryPostalCode(),
                user.getDeliveryAddress(),
                user.getDeliveryNotes(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getEnabled(),
                user.getEmailVerified(),
                user.getStellarPublicKey(),
                user.getStellarPublicKey() != null && user.getStellarSecretEnc() != null,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
