package budakgpt.yieldgridbackend.modules.telemetry.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import budakgpt.yieldgridbackend.modules.telemetry.entity.Telemetry;

public interface TelemetryRepository extends JpaRepository<Telemetry, UUID> {
    List<Telemetry> findByOrderIdOrderByTsAsc(UUID orderId);
}
