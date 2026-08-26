package com.rewear.backend.order.service;

import com.rewear.backend.order.dto.request.OrderCreateRequest;
import com.rewear.backend.order.dto.response.OrderResponse;
import com.rewear.backend.order.modal.Order;
import com.rewear.backend.order.modal.OrderItem;
import com.rewear.backend.order.repository.OrderRepository;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse createOrder(String userEmail, OrderCreateRequest request) {

        User buyer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Order order = Order.builder()
                .buyer(buyer)
                .totalAmountNpr(request.getTotalAmountNpr())
                .status("PENDING_PAYMENT")
                .build();

        List<OrderItem> items = request.getItems().stream()
                .map(i -> OrderItem.builder()
                        .order(order)
                        .listingId(i.getListingId())
                        .name(i.getName())
                        .image(i.getImage())
                        .price(i.getPrice())
                        .itemStatus(i.getStatus())
                        .rentalStart(i.getRentalStart())
                        .rentalEnd(i.getRentalEnd())
                        .rentalStartIso(i.getRentalStartIso())
                        .rentalEndIso(i.getRentalEndIso())
                        .rentalDays(i.getRentalDays())
                        .returnDeadline(i.getReturnDeadline())
                        .build())
                .collect(Collectors.toList());

        order.setItems(items);

        Order saved = orderRepository.save(order);
        log.info("Order created: id={} buyer={} items={}", saved.getId(), userEmail, items.size());

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String userEmail) {
        return orderRepository.findByBuyer_EmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                .map(i -> OrderResponse.OrderItemResponse.builder()
                        .listingId(i.getListingId())
                        .name(i.getName())
                        .image(i.getImage())
                        .price(i.getPrice())
                        .status(i.getItemStatus())
                        .rentalStart(i.getRentalStart())
                        .rentalEnd(i.getRentalEnd())
                        .rentalDays(i.getRentalDays())
                        .returnDeadline(i.getReturnDeadline())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .totalAmountNpr(order.getTotalAmountNpr())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}