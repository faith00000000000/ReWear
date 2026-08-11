package com.rewear.backend.order.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderCreateRequest {
    private List<OrderItemRequest> items;
    private Long totalAmountNpr;

    @Getter
    @Setter
    public static class OrderItemRequest {
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
