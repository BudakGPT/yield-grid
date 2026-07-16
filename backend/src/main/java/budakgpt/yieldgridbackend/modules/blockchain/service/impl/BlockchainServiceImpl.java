package budakgpt.yieldgridbackend.modules.blockchain.service.impl;

import budakgpt.yieldgridbackend.modules.blockchain.repository.BlockchainRepository;
import budakgpt.yieldgridbackend.modules.blockchain.service.BlockchainService;
import org.springframework.stereotype.Service;

@Service
public class BlockchainServiceImpl implements BlockchainService {
    private final BlockchainRepository blockchainRepository;

    public BlockchainServiceImpl(BlockchainRepository blockchainRepository) {
        this.blockchainRepository = blockchainRepository;
    }
}
