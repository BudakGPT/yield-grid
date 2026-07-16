package budakgpt.yieldgridbackend.modules.marketplace.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "marketplace_entities")
@Getter
@Setter
@NoArgsConstructor
public class MarketplaceEntity extends BaseEntity {
    // TODO: add domain fields for Marketplace
}
