package budakgpt.yieldgridbackend.modules.profile.dto;

import java.time.Instant;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.auth.enums.Role;

public record ProfileResponse(
        UUID id,
        String fullName,
        String email,
        Role role,
        String phoneNumber,
        String location,
        String deliveryRecipientName,
        String deliveryPhoneNumber,
        String deliveryProvince,
        String deliveryCity,
        String deliveryDistrict,
        String deliveryPostalCode,
        String deliveryAddress,
        String deliveryNotes,
        String bio,
        String avatarUrl,
        Boolean enabled,
        Boolean emailVerified,
        String stellarPublicKey,
        boolean walletReady,
        Instant createdAt,
        Instant updatedAt
) {
}
