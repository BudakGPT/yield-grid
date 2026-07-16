package budakgpt.yieldgridbackend.modules.order.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_entities")
@Getter
@Setter
@NoArgsConstructor
public class OrderEntity extends BaseEntity {
    // TODO: add domain fields for Order
}
