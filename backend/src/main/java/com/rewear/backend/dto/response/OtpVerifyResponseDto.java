package com.rewear.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@RequiredArgsConstructor
public class OtpVerifyResponseDto {
    private String resetToken;
    private Long expiresIn;
    private String message;
}
