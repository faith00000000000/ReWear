package com.rewear.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequestDto {

    @NotBlank(message = "Current Password is required")
    private String currentPassword;

    @NotBlank(message = "New Password is required")
    @Size(min = 6, max = 72, message = "Password must be between 6 and 72 characters")
    private String newPassword;

    @NotBlank(message = "Conform password is required")
    private String confirmPassword;
}

