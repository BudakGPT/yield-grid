package budakgpt.yieldgridbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import budakgpt.yieldgridbackend.config.IntegrationProperties;

@SpringBootApplication
@EnableConfigurationProperties(IntegrationProperties.class)
public class YieldgridBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(YieldgridBackendApplication.class, args);
    }

}
