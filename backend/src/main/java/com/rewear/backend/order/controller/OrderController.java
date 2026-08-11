package com.rewear.backend.order.controller;

import com.rewear.backend.order.dto.request.OrderCreateRequest;
import com.rewear.backend.order.dto.response.OrderResponse;
import com.rewear.backend.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal User principal,
            @RequestBody OrderCreateRequest request
    ) {
        return ResponseEntity.ok(orderService.createOrder(principal.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal User principal
    ) {
        return ResponseEntity.ok(orderService.getMyOrders(principal.getUsername()));
    }
}