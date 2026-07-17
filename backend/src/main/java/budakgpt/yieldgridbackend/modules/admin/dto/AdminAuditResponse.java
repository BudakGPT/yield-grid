package budakgpt.yieldgridbackend.modules.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminAuditResponse(
        UUID id,
        UUID actorId,
        String actorEmail,
        String action,
        String targetType,
        String targetId,
        String detail,
        Instant createdAt
) {
}
