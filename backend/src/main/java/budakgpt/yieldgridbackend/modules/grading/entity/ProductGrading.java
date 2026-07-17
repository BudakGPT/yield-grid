package budakgpt.yieldgridbackend.modules.grading.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import budakgpt.yieldgridbackend.modules.auth.entity.UserEntity;
import budakgpt.yieldgridbackend.modules.grading.enums.BuyerSegment;
import budakgpt.yieldgridbackend.modules.grading.enums.ShelfLifeBand;
import budakgpt.yieldgridbackend.modules.product.entity.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_gradings", indexes = {
        @Index(name = "idx_gradings_created_at", columnList = "created_at"),
        @Index(name = "idx_gradings_farmer_created", columnList = "farmer_id, created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductGrading {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farmer_id", nullable = false)
    private UserEntity farmer;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", unique = true)
    private Product product;

    @Column(nullable = false, length = 40)
    private String produceType;

    @Column(nullable = false)
    private Integer crateCount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal estWeightKg;

    @Column(nullable = false, precision = 6, scale = 5)
    private BigDecimal gradeA;

    @Column(nullable = false, precision = 6, scale = 5)
    private BigDecimal gradeB;

    @Column(nullable = false, precision = 6, scale = 5)
    private BigDecimal gradeReject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ShelfLifeBand shelfLifeBand;

    @Column(nullable = false)
    private Integer approxDays;

    @Column(nullable = false, length = 500)
    private String shelfLifeBasis;

    @Column(nullable = false, length = 3000)
    private String defectsJson;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal suggestedUnitPrice;

    @Column(nullable = false, length = 80)
    private String rubricVersion;

    @Column(nullable = false, length = 16)
    private String modelConfidence;

    @Column(nullable = false, length = 2048)
    private String photoUrl;

    @Column(length = 160)
    private String ipfsCid;

    @Column(length = 256)
    private String signature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private BuyerSegment suggestedSegment;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
