package com.rewear.backend.config;

import com.rewear.backend.user.enums.Role;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a single admin account on startup if one doesn't already exist,
 * identified by role = ADMIN (not by a hardcoded email match) so this
 * stays idempotent even if the admin later changes their email.
 *
 * Credentials come from env vars so nothing sensitive is hardcoded in
 * source, with dev-friendly fallbacks matching ReWear's defaults.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@rewear.com}")
    private String adminEmail;

    @Value("${admin.password:admin@123}")
    private String adminPassword;

    @Value("${admin.full-name:ReWear Admin}")
    private String adminFullName;

    @Override
    public void run(String... args) {
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == Role.ADMIN);

        if (adminExists) {
            log.info("Admin account already present — skipping seed");
            return;
        }

        String normalizedEmail = adminEmail.toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            log.warn("An account already exists with the configured admin email ({}) but is not ADMIN role — skipping seed to avoid clobbering it", adminEmail);
            return;
        }

        User admin = User.builder()
                .fullName(adminFullName)
                .email(normalizedEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .isActive(true)
                .build();

        userRepository.save(admin);
        log.info("Seeded admin account: {}", adminEmail);
    }
}