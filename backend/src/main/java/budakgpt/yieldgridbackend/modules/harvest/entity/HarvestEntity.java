package budakgpt.yieldgridbackend.modules.harvest.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "harvest_entities")
@Getter
@Setter
@NoArgsConstructor
public class HarvestEntity extends BaseEntity {
    // TODO: add domain fields for Harvest
}
