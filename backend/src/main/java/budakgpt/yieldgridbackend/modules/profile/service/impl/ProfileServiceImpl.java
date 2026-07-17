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

@Service
public class ProfileServiceImpl implements ProfileService {
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final ProfileMapper profileMapper;

    public ProfileServiceImpl(
            CurrentUserService currentUserService,
            UserRepository userRepository,
            ProfileMapper profileMapper
    ) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.profileMapper = profileMapper;
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
        if (request.bio() != null) {
            user.setBio(normalizeOptional(request.bio()));
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(normalizeOptional(request.avatarUrl()));
        }

        return profileMapper.toResponse(userRepository.save(user));
    }

    private String normalizeOptional(String value) {
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
