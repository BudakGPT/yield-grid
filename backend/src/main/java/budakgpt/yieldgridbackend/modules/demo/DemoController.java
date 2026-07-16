package budakgpt.yieldgridbackend.modules.demo;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import budakgpt.yieldgridbackend.modules.demo.dto.DemoMintRequest;
import budakgpt.yieldgridbackend.modules.demo.dto.DemoOrderRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/demo")
public class DemoController {
    private final DemoService demoService;

    public DemoController(DemoService demoService) {
        this.demoService = demoService;
    }

    @PostMapping("/transit/start")
    public Map<String, Object> startTransit(@Valid @RequestBody DemoOrderRequest request) {
        return demoService.startTransit(request.orderId());
    }

    @PostMapping("/breach")
    public Map<String, Object> injectBreach(@Valid @RequestBody DemoOrderRequest request) {
        return demoService.injectBreach(request.orderId());
    }

    @PostMapping("/mint")
    public Map<String, Object> mint(@Valid @RequestBody DemoMintRequest request) {
        return demoService.mint(request);
    }

    @PostMapping("/reset")
    public Map<String, Object> reset() {
        return demoService.reset();
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return demoService.health();
    }
}
