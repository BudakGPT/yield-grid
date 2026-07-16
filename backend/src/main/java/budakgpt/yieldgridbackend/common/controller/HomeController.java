package budakgpt.yieldgridbackend.common.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import budakgpt.yieldgridbackend.common.response.ApiResponse;

@RestController
public class HomeController {

    @GetMapping("/")
    public ApiResponse<HomeResponse> home() {
        HomeResponse response = new HomeResponse(
                "yieldgrid-backend",
                "running",
                "/swagger-ui.html",
                List.of(
                        "POST /api/auth/register",
                        "POST /api/auth/login",
                        "GET /api/products",
                        "GET /api/products/search",
                        "GET /api/categories",
                        "POST /api/orders",
                        "GET /api/orders/my",
                        "GET /api/orders/seller",
                        "/api/v1/user/health",
                        "/api/v1/farmer/health",
                        "/api/v1/harvest/health",
                        "/api/v1/order/health",
                        "/api/v1/marketplace/health"
                )
        );
        return ApiResponse.success("YieldGrid backend is running", response);
    }

    public record HomeResponse(
            String application,
            String status,
            String documentation,
            List<String> healthEndpoints
    ) {
    }
}
