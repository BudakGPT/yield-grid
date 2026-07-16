package budakgpt.yieldgridbackend.modules.cart.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import budakgpt.yieldgridbackend.modules.cart.entity.Cart;
import budakgpt.yieldgridbackend.modules.cart.entity.CartItem;
import budakgpt.yieldgridbackend.modules.product.entity.Product;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}
