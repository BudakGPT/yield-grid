package budakgpt.yieldgridbackend.modules.profile.service;

import budakgpt.yieldgridbackend.modules.profile.dto.ProfileResponse;
import budakgpt.yieldgridbackend.modules.profile.dto.UpdateProfileRequest;

public interface ProfileService {
    ProfileResponse getMyProfile();

    ProfileResponse updateMyProfile(UpdateProfileRequest request);

    ProfileResponse provisionMyWallet();
}
