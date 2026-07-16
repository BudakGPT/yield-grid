package budakgpt.yieldgridbackend.modules.analytics.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "analytics_entities")
@Getter
@Setter
@NoArgsConstructor
public class AnalyticsEntity extends BaseEntity {
    // TODO: add domain fields for Analytics
}
