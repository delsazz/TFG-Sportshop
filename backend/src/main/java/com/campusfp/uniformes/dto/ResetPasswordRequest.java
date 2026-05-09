package com.campusfp.uniformes.dto;

public record ResetPasswordRequest(
        String email,
        String code,
        String newPassword,
        String confirmPassword
) {
}
