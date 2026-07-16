package budakgpt.yieldgridbackend.modules.inspection.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inspection_entities")
@Getter
@Setter
@NoArgsConstructor
public class InspectionEntity extends BaseEntity {
    // TODO: add domain fields for Inspection
}
