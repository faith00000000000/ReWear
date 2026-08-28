package com.rewear.backend.wallet.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity @Table(name="seller_withdrawals",uniqueConstraints=@UniqueConstraint(columnNames={"seller_id","request_key"}))
@Getter @Setter @NoArgsConstructor
public class Withdrawal {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="seller_id",nullable=false) private Long sellerId;
 @Column(name="request_key",nullable=false,length=64) private String requestKey;
 @Column(nullable=false,precision=14,scale=2) private BigDecimal amount;
 @Column(nullable=false) private String gateway;
 @Column(nullable=false) private String account;
 @Column(nullable=false) private String status;
 @Column(nullable=false) private Instant createdAt;
}
