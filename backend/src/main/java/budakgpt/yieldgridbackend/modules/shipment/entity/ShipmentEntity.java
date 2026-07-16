package budakgpt.yieldgridbackend.modules.shipment.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "shipment_entities")
@Getter
@Setter
@NoArgsConstructor
public class ShipmentEntity extends BaseEntity {
    // TODO: add domain fields for Shipment
}
