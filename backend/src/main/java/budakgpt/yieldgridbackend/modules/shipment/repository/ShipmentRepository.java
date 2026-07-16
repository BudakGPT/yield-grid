package budakgpt.yieldgridbackend.modules.shipment.repository;

import budakgpt.yieldgridbackend.modules.shipment.entity.ShipmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentRepository extends JpaRepository<ShipmentEntity, Long> {
    // TODO: add custom query methods for Shipment
}
