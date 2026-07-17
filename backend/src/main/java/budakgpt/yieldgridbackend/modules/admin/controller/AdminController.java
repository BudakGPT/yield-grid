package budakgpt.yieldgridbackend.modules.admin.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import budakgpt.yieldgridbackend.modules.admin.dto.AdminAuditResponse;
import budakgpt.yieldgridbackend.modules.admin.dto.AdminOverviewResponse;
import budakgpt.yieldgridbackend.modules.admin.dto.AdminUserResponse;
import budakgpt.yieldgridbackend.modules.admin.dto.UpdateUserStatusRequest;
import budakgpt.yieldgridbackend.modules.admin.service.AdminService;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.grading.dto.GradeRecommendationResponse;
import budakgpt.yieldgridbackend.modules.grading.dto.UpdateGradeRecommendationRequest;
import budakgpt.yieldgridbackend.modules.order.dto.OrderResponse;
import budakgpt.yieldgridbackend.modules.order.dto.OrderSummaryResponse;
import budakgpt.yieldgridbackend.modules.order.dto.UpdateOrderStatusRequest;
import budakgpt.yieldgridbackend.modules.product.dto.ChangeStatusRequest;
import budakgpt.yieldgridbackend.modules.product.dto.ProductResponse;
import budakgpt.yieldgridbackend.modules.product.dto.ProductSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Central monitoring and control for YieldGrid administrators")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Get system overview and dependency health")
    public AdminOverviewResponse overview() {
        return adminService.overview();
    }

    @GetMapping("/users")
    @Operation(summary = "Search and list users")
    public Page<AdminUserResponse> users(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean enabled,
            Pageable pageable
    ) {
        return adminService.users(query, role, enabled, pageable);
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Enable or disable a user account")
    public AdminUserResponse updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        return adminService.updateUserStatus(id, request.enabled());
    }

    @GetMapping("/orders")
    @Operation(summary = "List all orders")
    public Page<OrderSummaryResponse> orders(Pageable pageable) {
        return adminService.orders(pageable);
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Advance or resolve an order status")
    public OrderResponse updateOrderStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return adminService.updateOrderStatus(id, request);
    }

    @GetMapping("/products")
    @Operation(summary = "List all products, including archived products")
    public Page<ProductSummaryResponse> products(Pageable pageable) {
        return adminService.products(pageable);
    }

    @PatchMapping("/products/{id}/status")
    @Operation(summary = "Change a product status")
    public ProductResponse updateProductStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeStatusRequest request
    ) {
        return adminService.updateProductStatus(id, request);
    }

    @GetMapping("/grade-recommendations")
    @Operation(summary = "List the marketplace recommendation for each quality grade")
    public java.util.List<GradeRecommendationResponse> gradeRecommendations() {
        return adminService.gradeRecommendations();
    }

    @PatchMapping("/grade-recommendations/{grade}")
    @Operation(summary = "Update the marketplace recommendation for a quality grade")
    public GradeRecommendationResponse updateGradeRecommendation(
            @PathVariable String grade,
            @Valid @RequestBody UpdateGradeRecommendationRequest request
    ) {
        return adminService.updateGradeRecommendation(grade, request);
    }

    @GetMapping("/audit")
    @Operation(summary = "List administrator control actions")
    public Page<AdminAuditResponse> auditEvents(Pageable pageable) {
        return adminService.auditEvents(pageable);
    }
}
