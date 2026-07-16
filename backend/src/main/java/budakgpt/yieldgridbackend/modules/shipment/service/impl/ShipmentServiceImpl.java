package budakgpt.yieldgridbackend.modules.shipment.service.impl;

import budakgpt.yieldgridbackend.modules.shipment.repository.ShipmentRepository;
import budakgpt.yieldgridbackend.modules.shipment.service.ShipmentService;
import org.springframework.stereotype.Service;

@Service
public class ShipmentServiceImpl implements ShipmentService {
    private final ShipmentRepository shipmentRepository;

    public ShipmentServiceImpl(ShipmentRepository shipmentRepository) {
        this.shipmentRepository = shipmentRepository;
    }
}
