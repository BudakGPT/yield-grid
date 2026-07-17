package budakgpt.yieldgridbackend.modules.order.repository;

import java.util.Optional;
import java.util.Collection;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.order.entity.Order;
import budakgpt.yieldgridbackend.modules.order.enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByBuyer(UserEntity buyer, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Optional<Order> findByOrderNumber(String orderNumber);

    long countByStatus(OrderStatus status);

    long countByStatusIn(Collection<OrderStatus> statuses);

    @Query("""
            select distinct o from CustomerOrder o
            join o.items i
            where i.seller = :seller
            """)
    Page<Order> findOrdersBySeller(@Param("seller") UserEntity seller, Pageable pageable);
}
