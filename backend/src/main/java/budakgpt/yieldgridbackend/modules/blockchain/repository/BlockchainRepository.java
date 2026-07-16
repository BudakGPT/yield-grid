package budakgpt.yieldgridbackend.modules.blockchain.repository;

import budakgpt.yieldgridbackend.modules.blockchain.entity.BlockchainEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlockchainRepository extends JpaRepository<BlockchainEntity, Long> {
    // TODO: add custom query methods for Blockchain
}
