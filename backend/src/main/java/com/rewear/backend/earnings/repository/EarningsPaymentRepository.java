package com.rewear.backend.earnings.repository;
import com.rewear.backend.payment.modal.PaymentTransaction;
import com.rewear.backend.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.*;
import java.util.List;
public interface EarningsPaymentRepository extends JpaRepository<PaymentTransaction,Long> {
 @EntityGraph(attributePaths={"order","order.buyer"})
 List<PaymentTransaction> findByPaymentStatusOrderByCompletedAtDescIdDesc(PaymentStatus status);
}
