package com.rewear.backend.order.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {
    private Long id;
    private String status;
    private Long totalAmountNpr;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    @Getter
    @Builder
    public static class OrderItemResponse {
        private Long listingId;
        private String name;
        private String image;
        private String price;
        private String status;
        private String rentalStart;
        private String rentalEnd;
        private Integer rentalDays;
        private String returnDeadline;
    }
}