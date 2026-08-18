package com.rewear.backend.user.enums;

/**
 * Derived, admin-facing marketplace role. NOT stored on the User entity.
 * Every user starts as BUYER; the moment they have at least one listing,
 * they're shown as SELLER — regardless of whether they've also bought
 * anything. No separate "hybrid" state.
 */
public enum AdminUserRole {
    BUYER,
    SELLER
}