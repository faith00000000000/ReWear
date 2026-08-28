package com.rewear.backend.wallet.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity @Table(name="refund_receipts",uniqueConstraints={@UniqueConstraint(columnNames={"item_id"}),@UniqueConstraint(columnNames={"gateway","provider_reference"})})
@Getter @Setter @NoArgsConstructor
public class RefundReceipt {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="item_id",nullable=false) private Long itemId;
 @Column(nullable=false) private Long adminId;
 @Column(nullable=false,precision=14,scale=2) private BigDecimal amount;
 @Column(nullable=false,length=16) private String gateway;
 @Column(name="provider_reference",nullable=false,length=120) private String providerReference;
 @Column(nullable=false) private Instant recordedAt;
}
