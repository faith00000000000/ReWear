package com.rewear.backend.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequestDto {

    @NotBlank(message = "Reset Token is required")
    private String resetToken;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max=72, message = "Password must be between 6 and 72 characters")
    private String newPassword;
}
