package budakgpt.yieldgridbackend.modules.cart.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.auth.enums.Role;
import budakgpt.yieldgridbackend.modules.auth.repository.UserRepository;
import budakgpt.yieldgridbackend.modules.cart.dto.AddToCartRequest;
import budakgpt.yieldgridbackend.modules.cart.dto.CartResponse;
import budakgpt.yieldgridbackend.modules.cart.dto.CheckoutRequest;
import budakgpt.yieldgridbackend.modules.cart.dto.UpdateCartItemRequest;
import budakgpt.yieldgridbackend.modules.cart.entity.Cart;
import budakgpt.yieldgridbackend.modules.cart.entity.CartItem;
import budakgpt.yieldgridbackend.modules.cart.exception.CartItemNotFoundException;
import budakgpt.yieldgridbackend.modules.cart.exception.EmptyCartCheckoutException;
import budakgpt.yieldgridbackend.modules.cart.exception.UnauthorizedCartAccessException;
import budakgpt.yieldgridbackend.modules.cart.mapper.CartMapper;
import budakgpt.yieldgridbackend.modules.cart.repository.CartItemRepository;
import budakgpt.yieldgridbackend.modules.cart.repository.CartRepository;
import budakgpt.yieldgridbackend.modules.cart.service.CartService;
import budakgpt.yieldgridbackend.modules.order.dto.CreateOrderRequest;
import budakgpt.yieldgridbackend.modules.order.dto.OrderItemRequest;
import budakgpt.yieldgridbackend.modules.order.dto.OrderResponse;
import budakgpt.yieldgridbackend.modules.order.exception.InsufficientStockException;
import budakgpt.yieldgridbackend.modules.order.exception.InvalidOrderRequestException;
import budakgpt.yieldgridbackend.modules.order.exception.ProductInactiveException;
import budakgpt.yieldgridbackend.modules.order.service.OrderService;
import budakgpt.yieldgridbackend.modules.product.entity.Product;
import budakgpt.yieldgridbackend.modules.product.enums.ProductStatus;
import budakgpt.yieldgridbackend.modules.product.exception.ProductNotFoundException;
import budakgpt.yieldgridbackend.modules.product.repository.ProductRepository;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final CartMapper cartMapper;

    public CartServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderService orderService,
            CartMapper cartMapper
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.cartMapper = cartMapper;
    }

    @Override
    @Transactional
    public CartResponse getMyCart() {
        return cartMapper.toResponse(getOrCreateBuyerCart(currentUser()));
    }

    @Override
    @Transactional
    public CartResponse addItem(AddToCartRequest request) {
        UserEntity buyer = currentBuyer();
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ProductNotFoundException(request.productId()));
        validateProductCanBeAdded(product, buyer, request.quantity());

        Cart cart = getOrCreateBuyerCart(buyer);
        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .map(existing -> {
                    existing.updateQuantity(existing.getQuantity() + request.quantity());
                    return existing;
                })
                .orElseGet(() -> {
                    CartItem newItem = CartItem.builder()
                            .product(product)
                            .quantity(request.quantity())
                            .unitPrice(product.getPrice())
                            .subtotal(product.getPrice().multiply(BigDecimal.valueOf(request.quantity())))
                            .build();
                    cart.addItem(newItem);
                    return newItem;
                });

        validateProductCanBeAdded(product, buyer, item.getQuantity());
        cart.recalculateSubtotal();
        return cartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse updateItem(UUID itemId, UpdateCartItemRequest request) {
        UserEntity buyer = currentBuyer();
        Cart cart = getOrCreateBuyerCart(buyer);
        CartItem item = findOwnedItem(cart, itemId);

        validateProductCanBeAdded(item.getProduct(), buyer, request.quantity());
        item.updateQuantity(request.quantity());
        cart.recalculateSubtotal();
        return cartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void removeItem(UUID itemId) {
        Cart cart = getOrCreateBuyerCart(currentBuyer());
        CartItem item = findOwnedItem(cart, itemId);
        cart.removeItem(item);
        cart.recalculateSubtotal();
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart() {
        Cart cart = getOrCreateBuyerCart(currentBuyer());
        cart.clearItems();
        cart.recalculateSubtotal();
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        UserEntity buyer = currentBuyer();
        Cart cart = getOrCreateBuyerCart(buyer);
        if (cart.getItems().isEmpty()) {
            throw new EmptyCartCheckoutException();
        }

        cart.getItems().forEach(item -> validateProductCanBeAdded(item.getProduct(), buyer, item.getQuantity()));
        CreateOrderRequest orderRequest = new CreateOrderRequest(
                toOrderItems(cart),
                request.paymentMethod(),
                request.recipientName(),
                request.recipientPhone(),
                request.province(),
                request.city(),
                request.district(),
                request.postalCode(),
                request.fullAddress(),
                request.notes()
        );

        OrderResponse response = orderService.createOrder(orderRequest);
        cart.clearItems();
        cart.recalculateSubtotal();
        cartRepository.save(cart);
        return response;
    }

    private List<OrderItemRequest> toOrderItems(Cart cart) {
        return cart.getItems().stream()
                .map(item -> new OrderItemRequest(item.getProduct().getId(), item.getQuantity()))
                .toList();
    }

    private Cart getOrCreateBuyerCart(UserEntity buyer) {
        if (buyer.getRole() != Role.BUYER) {
            throw new UnauthorizedCartAccessException();
        }
        return cartRepository.findByBuyer(buyer)
                .orElseGet(() -> cartRepository.save(Cart.builder()
                        .buyer(buyer)
                        .subtotal(BigDecimal.ZERO)
                        .build()));
    }

    private CartItem findOwnedItem(Cart cart, UUID itemId) {
        CartItem item = cartItemRepository.findById(itemId).orElseThrow(() -> new CartItemNotFoundException(itemId));
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new UnauthorizedCartAccessException();
        }
        return item;
    }

    private void validateProductCanBeAdded(Product product, UserEntity buyer, int quantity) {
        if (product.getSeller().getId().equals(buyer.getId())) {
            throw new InvalidOrderRequestException("Buyer cannot add their own product to cart");
        }
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ProductInactiveException(product.getName());
        }
        if (product.getStock() <= 0 || product.getStock() < quantity) {
            throw new InsufficientStockException(product.getName());
        }
    }

    private UserEntity currentBuyer() {
        UserEntity user = currentUser();
        if (user.getRole() != Role.BUYER) {
            throw new UnauthorizedCartAccessException();
        }
        return user;
    }

    private UserEntity currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedCartAccessException();
        }
        return userRepository.findByEmail(authentication.getName()).orElseThrow(UnauthorizedCartAccessException::new);
    }
}
