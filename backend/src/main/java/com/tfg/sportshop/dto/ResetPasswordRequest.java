package com.tfg.sportshop.dto;

public record ResetPasswordRequest(
        String email,
        String code,
        String newPassword,
        String confirmPassword
) {
}
