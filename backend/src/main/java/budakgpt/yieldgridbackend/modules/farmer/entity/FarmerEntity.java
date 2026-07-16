package budakgpt.yieldgridbackend.modules.farmer.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "farmer_entities")
@Getter
@Setter
@NoArgsConstructor
public class FarmerEntity extends BaseEntity {
    // TODO: add domain fields for Farmer
}
