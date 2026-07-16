package budakgpt.yieldgridbackend.modules.blockchain.entity;

import budakgpt.yieldgridbackend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "blockchain_entities")
@Getter
@Setter
@NoArgsConstructor
public class BlockchainEntity extends BaseEntity {
    // TODO: add domain fields for Blockchain
}
