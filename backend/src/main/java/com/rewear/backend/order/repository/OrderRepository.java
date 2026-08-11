package com.rewear.backend.order.repository;

import com.rewear.backend.order.modal.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyer_EmailOrderByCreatedAtDesc(String email);
}
