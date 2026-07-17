package budakgpt.yieldgridbackend.modules.admin.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record AdminOverviewResponse(
        Metrics metrics,
        List<IntegrationStatus> integrations,
        List<AdminAuditResponse> recentActivity,
        Instant generatedAt
) {
    public record Metrics(
            long totalUsers,
            long activeUsers,
            long buyers,
            long sellers,
            long totalProducts,
            long activeProducts,
            long totalOrders,
            long activeOrders,
            long totalGradings,
            Map<String, Long> ordersByStatus
    ) {
    }

    public record IntegrationStatus(
            String name,
            String status,
            String detail,
            Long latencyMs
    ) {
    }
}
