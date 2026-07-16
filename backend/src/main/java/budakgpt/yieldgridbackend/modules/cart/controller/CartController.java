package budakgpt.yieldgridbackend.modules.cart.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import budakgpt.yieldgridbackend.modules.cart.dto.AddToCartRequest;
import budakgpt.yieldgridbackend.modules.cart.dto.CartResponse;
import budakgpt.yieldgridbackend.modules.cart.dto.CheckoutRequest;
import budakgpt.yieldgridbackend.modules.cart.dto.UpdateCartItemRequest;
import budakgpt.yieldgridbackend.modules.cart.service.CartService;
import budakgpt.yieldgridbackend.modules.order.dto.OrderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart", description = "Buyer shopping cart and checkout")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Get current buyer cart")
    public CartResponse getMyCart() {
        return cartService.getMyCart();
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Add product to cart")
    public CartResponse addItem(@Valid @RequestBody AddToCartRequest request) {
        return cartService.addItem(request);
    }

    @PatchMapping("/items/{itemId}")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Update cart item quantity")
    public CartResponse updateItem(
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return cartService.updateItem(itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Remove cart item")
    public void removeItem(@PathVariable UUID itemId) {
        cartService.removeItem(itemId);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Clear current buyer cart")
    public void clearCart() {
        cartService.clearCart();
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('BUYER')")
    @Operation(summary = "Checkout current cart into an order")
    public OrderResponse checkout(@Valid @RequestBody CheckoutRequest request) {
        return cartService.checkout(request);
    }
}
