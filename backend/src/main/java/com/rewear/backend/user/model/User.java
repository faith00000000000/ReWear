package com.rewear.backend.user.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.rewear.backend.user.enums.Role;
import com.rewear.backend.user.enums.UserStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /** Blank string for OAuth-only users — never null */
    @Column(nullable = false)
    @Builder.Default
    private String password = "";

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    /** "google" for OAuth users, null for email/password users */
    @Column(name = "oauth_provider")
    private String oauthProvider;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    // NEW — admin moderation status. Independent of isActive (which is for
    // self-service deactivation). BANNED should always force isActive=false
    // so the account can't authenticate; FLAGGED does not.
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    // NEW — set only when status = BANNED
    @Column(name = "ban_reason", length = 500)
    private String banReason;

    @Column(name = "banned_at")
    private LocalDateTime bannedAt;
}