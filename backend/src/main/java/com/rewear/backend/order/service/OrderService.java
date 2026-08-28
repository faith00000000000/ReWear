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

    private final com.rewear.backend.earnings.service.OrderEarningsSnapshotService snapshotService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse createOrder(String userEmail, OrderCreateRequest request) {

        if(request.getItems()==null || request.getItems().isEmpty()) throw new IllegalArgumentException("Cart is empty");
        if(request.getItems().stream().map(OrderCreateRequest.OrderItemRequest::getListingId).distinct().count()!=request.getItems().size())
            throw new IllegalArgumentException("A clothing item can only appear once in an order");
        User buyer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Order order = Order.builder()
                .buyer(buyer)
                .totalAmountNpr(request.getTotalAmountNpr())
                .status("PENDING_PAYMENT")
                .build();

        List<OrderItem> items = request.getItems().stream()
                .map(i -> snapshotService.snapshot(OrderItem.builder()
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
                        .build(), i))
                .collect(Collectors.toList());

        order.setItems(items);
        java.math.BigDecimal payable = items.stream().map(i -> i.getFeeAmountNpr().add(i.getDepositAmountNpr()).add(i.getShippingAmountNpr()))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        try { order.setTotalAmountNpr(payable.longValueExact()); }
        catch (ArithmeticException fractional) { throw new IllegalArgumentException("This sandbox checkout currently requires a whole-NPR total"); }

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