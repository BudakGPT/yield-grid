package budakgpt.yieldgridbackend.modules.telemetry.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import budakgpt.yieldgridbackend.modules.order.entity.Order;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "telemetry")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Telemetry {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Instant ts;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal lat;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal lng;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal tempC;

    @Builder.Default
    @Column(nullable = false)
    private Boolean simulated = true;
}
