package budakgpt.yieldgridbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI farmLedgerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FarmLedger API")
                        .version("v1")
                        .description("TODO: document the modules and endpoints"));
    }
}
