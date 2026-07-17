package budakgpt.yieldgridbackend.modules.profile.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 100, message = "Full name must contain between 2 and 100 characters")
        @Pattern(regexp = ".*\\S.*", message = "Full name must not be blank")
        String fullName,

        @Pattern(
                regexp = "^$|^[0-9+() .-]{7,32}$",
                message = "Phone number must contain 7 to 32 valid phone characters"
        )
        String phoneNumber,

        @Size(max = 120, message = "Location must not exceed 120 characters")
        String location,

        @Size(max = 500, message = "Bio must not exceed 500 characters")
        String bio,

        @Size(max = 2048, message = "Avatar URL must not exceed 2048 characters")
        @Pattern(
                regexp = "^$|https?://.+",
                message = "Avatar URL must use http or https"
        )
        String avatarUrl
) {
}
