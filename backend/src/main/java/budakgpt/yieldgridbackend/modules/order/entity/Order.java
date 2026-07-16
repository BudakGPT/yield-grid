package budakgpt.yieldgridbackend.modules.order.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.order.enums.OrderStatus;
import budakgpt.yieldgridbackend.modules.order.enums.PaymentMethod;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "CustomerOrder")
@Table(name = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 40)
    private String orderNumber;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "buyer_id", nullable = false)
    private UserEntity buyer;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OrderStatus status;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PaymentMethod paymentMethod;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal subtotal;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal shippingFee;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String recipientName;

    @NotBlank
    @Size(max = 40)
    @Column(nullable = false, length = 40)
    private String recipientPhone;

    @Size(max = 120)
    @Column(length = 120)
    private String province;

    @Size(max = 120)
    @Column(length = 120)
    private String city;

    @Size(max = 120)
    @Column(length = 120)
    private String district;

    @Size(max = 20)
    @Column(length = 20)
    private String postalCode;

    @NotBlank
    @Size(max = 1000)
    @Column(nullable = false, length = 1000)
    private String fullAddress;

    @Size(max = 1000)
    @Column(length = 1000)
    private String notes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant orderedAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    private Instant completedAt;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public void addItem(OrderItem item) {
        item.setOrder(this);
        items.add(item);
    }
}
