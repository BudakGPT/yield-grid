from pathlib import Path
import textwrap

root = Path(r"u:\Universitas Indonesia - S1\Semester 4\AdPro\AdProB16-2\yieldgrid-backend")

pom = '''<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.2</version>
        <relativePath/>
    </parent>

    <groupId>budakgpt</groupId>
    <artifactId>yieldgrid-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>yieldgrid-backend</name>
    <description>FarmLedger backend scaffolding</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.6.0</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
'''
(root / 'pom.xml').write_text(pom, encoding='utf-8')

(root / 'src/main/resources').mkdir(parents=True, exist_ok=True)
application_yml = '''server:
  port: 8080

spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/farmledger}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    operationsSorter: method
'''
(root / 'src/main/resources/application.yml').write_text(application_yml, encoding='utf-8')

files = {}
files['src/main/java/budakgpt/yieldgridbackend/common/entity/BaseEntity.java'] = '''package budakgpt.yieldgridbackend.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
'''
files['src/main/java/budakgpt/yieldgridbackend/common/response/ApiResponse.java'] = '''package budakgpt.yieldgridbackend.common.response;

import java.time.Instant;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        String errorCode,
        Instant timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Request completed successfully", data, null, Instant.now());
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, Instant.now());
    }

    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(false, message, null, "REQUEST_FAILED", Instant.now());
    }

    public static <T> ApiResponse<T> failure(String message, String errorCode) {
        return new ApiResponse<>(false, message, null, errorCode, Instant.now());
    }
}
'''
files['src/main/java/budakgpt/yieldgridbackend/common/exception/GlobalExceptionHandler.java'] = '''package budakgpt.yieldgridbackend.common.exception;

import budakgpt.yieldgridbackend.common.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure(exception.getMessage(), "BAD_REQUEST"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpectedException(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.failure("An unexpected error occurred", "INTERNAL_SERVER_ERROR"));
    }
}
'''
files['src/main/java/budakgpt/yieldgridbackend/common/util/DateTimeUtil.java'] = '''package budakgpt.yieldgridbackend.common.util;

public final class DateTimeUtil {
    private DateTimeUtil() {
        // TODO: add shared date/time helpers
    }
}
'''
files['src/main/java/budakgpt/yieldgridbackend/common/constants/AppConstants.java'] = '''package budakgpt.yieldgridbackend.common.constants;

public final class AppConstants {
    public static final String DEFAULT_PAGE_SIZE = "20";

    private AppConstants() {
        // TODO: add shared constants
    }
}
'''
files['src/main/java/budakgpt/yieldgridbackend/config/SwaggerConfig.java'] = '''package budakgpt.yieldgridbackend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
'''
files['src/main/java/budakgpt/yieldgridbackend/config/JpaConfig.java'] = '''package budakgpt.yieldgridbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
'''
files['src/main/java/budakgpt/yieldgridbackend/security/SecurityConfig.java'] = '''package budakgpt.yieldgridbackend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
'''

modules = ['auth', 'user', 'farmer', 'harvest', 'inspection', 'marketplace', 'order', 'shipment', 'blockchain', 'analytics', 'notification']
for module in modules:
    pkg = f'budakgpt.yieldgridbackend.modules.{module}'
    base_dir = root / f'src/main/java/budakgpt/yieldgridbackend/modules/{module}'
    for sub in ['controller', 'service', 'service/impl', 'repository', 'entity', 'dto', 'mapper', 'exception']:
        (base_dir / sub).mkdir(parents=True, exist_ok=True)

    class_name = ''.join(part.capitalize() for part in module.split('-'))
    entity_name = f'{class_name}Entity'
    dto_name = f'{class_name}Dto'
    exception_name = f'{class_name}Exception'
    repo_name = f'{class_name}Repository'
    service_name = f'{class_name}Service'
    impl_name = f'{class_name}ServiceImpl'
    controller_name = f'{class_name}Controller'
    mapper_name = f'{class_name}Mapper'

    files[f'src/main/java/budakgpt/yieldgridbackend/modules/{module}/controller/{controller_name}.java'] = f'''package {pkg}.controller;

import {pkg}.service.{service_name};
import budakgpt.yieldgridbackend.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/{module}")
public class {controller_name} {{
    private final {service_name} {module}Service;

    public {controller_name}({service_name} {module}Service) {{
        this.{module}Service = {module}Service;
    }}

    @GetMapping("/health")
    public ApiResponse<String> health() {{
        return ApiResponse.success("{class_name} module ready");
    }}

    @PostMapping
    public ApiResponse<String> createPlaceholder() {{
        return ApiResponse.success("TODO: implement {class_name} endpoint");
    }}
}}
'''
    files[f'src/main/java/budakgpt/yieldgridbackend/modules/{module}/service/{service_name}.java'] = f'''package {pkg}.service;

public interface {service_name} {{
    // TODO: add business operations for {class_name}
}}
'''
    files[f'src/main/java/budakgpt/yieldgridbackend/modules/{module}/service/impl/{impl_name}.java'] = f'''package {pkg}.service.impl;

import {pkg}.repository.{repo_name};
import {pkg}.service.{service_name};
import org.springframework.stereotype.Service;

@Service
public class {impl_name} implements {service_name} {{
    private final {repo_name} {module}Repository;

    public {impl_name}({repo_name} {module}Repository) {{
        this.{module}Repository = {module}Repository;
    }}
}}
'''
    files[f'src/main/java/budakgpt/yieldgridbackend/modules/{module}/repository/{repo_name}.java'] = f'''package {pkg}.repository;

import {pkg}.entity.{entity_name};
import org.springframework.data.jpa.repository.JpaRepository;

public interface {repo_name} extends JpaRepository<{entity_name}, Long> {{
    // TODO: add custom query methods for {class_name}
}}
'''
    files[f'src/main/java/budakgpt/yieldgridbackend/modules/{module}/entity/{entity_name}.java'] = f'''package {pkg}.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "{module}_entities")
@Getter
@Setter
@NoArgsConstructor
public class {entity_name} extends BaseEntity {{
    // TODO: add domain fields for {class_name}
}}
'''
    files[f'src/main/java/budakgpt/yieldgridbackend/modules/{module}/dto/{dto_name}.java'] = f'''package {pkg}.dto;

public class {dto_name} {{
    // TODO: add DTO fields for {class_name}
}}
'''
    files[f'src/main/java/budakgpt/yieldgridbackend/modules/{module}/mapper/{mapper_name}.java'] = f'''package {pkg}.mapper;

public interface {mapper_name} {{
    // TODO: implement mapping for {class_name}
}}
'''
    files[f'src/main/java/budakgpt/yieldgridbackend/modules/{module}/exception/{exception_name}.java'] = f'''package {pkg}.exception;

public class {exception_name} extends RuntimeException {{
    public {exception_name}(String message) {{
        super(message);
    }}
}}
'''

for relative_path, content in files.items():
    path = root / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(textwrap.dedent(content).lstrip(), encoding='utf-8')

print('Scaffolding complete')
