package budakgpt.yieldgridbackend.modules.order.repository;

import budakgpt.yieldgridbackend.modules.order.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    // TODO: add custom query methods for Order
}
