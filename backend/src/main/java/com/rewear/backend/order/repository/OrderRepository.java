package com.rewear.backend.order.repository;

import com.rewear.backend.order.modal.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select o from Order o where o.id=:id")
    java.util.Optional<Order> lockOrder(@org.springframework.data.repository.query.Param("id") Long id);
    List<Order> findByBuyer_EmailOrderByCreatedAtDesc(String email);
    // in OrderRepository
long countByBuyerId(Long buyerId);
}
