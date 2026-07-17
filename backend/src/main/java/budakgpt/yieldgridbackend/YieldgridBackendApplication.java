package budakgpt.yieldgridbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import budakgpt.yieldgridbackend.config.IntegrationProperties;
import budakgpt.yieldgridbackend.config.OpenRouterProperties;
import budakgpt.yieldgridbackend.modules.auth.config.SupabaseAuthProperties;

@SpringBootApplication
@EnableConfigurationProperties({IntegrationProperties.class, OpenRouterProperties.class, SupabaseAuthProperties.class})
public class YieldgridBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(YieldgridBackendApplication.class, args);
    }

}
