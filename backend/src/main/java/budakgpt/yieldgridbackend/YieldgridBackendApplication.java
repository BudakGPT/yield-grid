package budakgpt.yieldgridbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;

import budakgpt.yieldgridbackend.config.IntegrationProperties;
import budakgpt.yieldgridbackend.config.OpenRouterProperties;
import budakgpt.yieldgridbackend.config.PinataProperties;
import budakgpt.yieldgridbackend.modules.auth.config.SupabaseAuthProperties;
import budakgpt.yieldgridbackend.modules.auth.config.AdminAccessProperties;

@SpringBootApplication
@EnableAsync
@EnableConfigurationProperties({
        IntegrationProperties.class,
        OpenRouterProperties.class,
        PinataProperties.class,
        SupabaseAuthProperties.class,
        AdminAccessProperties.class
})
public class YieldgridBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(YieldgridBackendApplication.class, args);
    }

}
