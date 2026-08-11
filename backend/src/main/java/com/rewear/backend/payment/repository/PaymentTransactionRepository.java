package com.rewear.backend.payment.repository;
import com.rewear.backend.payment.modal.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByReferenceId(String referenceId);
}