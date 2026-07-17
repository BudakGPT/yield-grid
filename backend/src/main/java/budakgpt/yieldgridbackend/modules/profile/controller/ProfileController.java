package budakgpt.yieldgridbackend.modules.profile.controller;

import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import budakgpt.yieldgridbackend.modules.profile.dto.ProfileResponse;
import budakgpt.yieldgridbackend.modules.profile.dto.UpdateProfileRequest;
import budakgpt.yieldgridbackend.modules.profile.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/profile/me", produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("isAuthenticated()")
@Tag(name = "Profile", description = "Manage the authenticated user's YieldGrid profile")
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @Operation(
            summary = "Get my profile",
            description = "Returns editable profile details and read-only Supabase identity and wallet status"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile returned"),
            @ApiResponse(responseCode = "401", description = "Authentication is required")
    })
    public ProfileResponse getMyProfile() {
        return profileService.getMyProfile();
    }

    @PatchMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Update my profile",
            description = "Partially updates full name, phone number, location, bio, or avatar URL. Email, role, verification, and wallet fields are read-only."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile updated"),
            @ApiResponse(responseCode = "400", description = "Profile data is invalid"),
            @ApiResponse(responseCode = "401", description = "Authentication is required")
    })
    public ProfileResponse updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return profileService.updateMyProfile(request);
    }
}
