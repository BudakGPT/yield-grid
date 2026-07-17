package budakgpt.yieldgridbackend.modules.profile.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.common.security.CurrentUserService;
import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.profile.dto.ProfileResponse;
import budakgpt.yieldgridbackend.modules.profile.dto.UpdateProfileRequest;
import budakgpt.yieldgridbackend.modules.profile.mapper.ProfileMapper;
import budakgpt.yieldgridbackend.modules.profile.service.ProfileService;
import budakgpt.yieldgridbackend.modules.stellar.WalletProvisioningService;

@Service
public class ProfileServiceImpl implements ProfileService {
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final ProfileMapper profileMapper;
    private final WalletProvisioningService walletProvisioningService;

    public ProfileServiceImpl(
            CurrentUserService currentUserService,
            UserRepository userRepository,
            ProfileMapper profileMapper,
            WalletProvisioningService walletProvisioningService
    ) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.profileMapper = profileMapper;
        this.walletProvisioningService = walletProvisioningService;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile() {
        return profileMapper.toResponse(currentUserService.requireUser());
    }

    @Override
    @Transactional
    public ProfileResponse updateMyProfile(UpdateProfileRequest request) {
        UserEntity user = currentUserService.requireUser();

        if (request.fullName() != null) {
            user.setFullName(request.fullName().trim());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(normalizeOptional(request.phoneNumber()));
        }
        if (request.location() != null) {
            user.setLocation(normalizeOptional(request.location()));
        }
        if (request.deliveryRecipientName() != null) {
            user.setDeliveryRecipientName(normalizeOptional(request.deliveryRecipientName()));
        }
        if (request.deliveryPhoneNumber() != null) {
            user.setDeliveryPhoneNumber(normalizeOptional(request.deliveryPhoneNumber()));
        }
        if (request.deliveryProvince() != null) {
            user.setDeliveryProvince(normalizeOptional(request.deliveryProvince()));
        }
        if (request.deliveryCity() != null) {
            user.setDeliveryCity(normalizeOptional(request.deliveryCity()));
        }
        if (request.deliveryDistrict() != null) {
            user.setDeliveryDistrict(normalizeOptional(request.deliveryDistrict()));
        }
        if (request.deliveryPostalCode() != null) {
            user.setDeliveryPostalCode(normalizeOptional(request.deliveryPostalCode()));
        }
        if (request.deliveryAddress() != null) {
            user.setDeliveryAddress(normalizeOptional(request.deliveryAddress()));
        }
        if (request.deliveryNotes() != null) {
            user.setDeliveryNotes(normalizeOptional(request.deliveryNotes()));
        }
        if (request.bio() != null) {
            user.setBio(normalizeOptional(request.bio()));
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(normalizeOptional(request.avatarUrl()));
        }

        return profileMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public ProfileResponse provisionMyWallet() {
        return profileMapper.toResponse(walletProvisioningService.ensureProvisioned(currentUserService.requireUser()));
    }

    private String normalizeOptional(String value) {
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
