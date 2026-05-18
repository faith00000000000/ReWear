package com.rewear.backend.model;


// import com.rewear.backend.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * User entity — represents both owners and renters on ReWear.
 */
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

    @Column(nullable = false)
    private String password;

    //@Enumerated(EnumType.STRING)
    // @Column(nullable = false)
    // private Role role;

    // @Column(name = "profile_picture_url")
    // private String profilePictureUrl;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // @Column(name = "oauth_provider")
    // private String oauthProvider; // e.g., "google" — null for regular signup

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
}