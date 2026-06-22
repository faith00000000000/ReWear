package com.rewear.backend.user.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthCheckController {

    @Value("${spring.application.name:ReWear Backend}")
    private String applicationName;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    /**
     * Health check endpoint
     * Returns basic health information about the API
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("application", applicationName);
        health.put("environment", activeProfile);
        
        return ResponseEntity.ok(health);
    }

    /**
     * Detailed health check endpoint
     * Returns detailed health information including API version
     */
    @GetMapping("/detailed")
    public ResponseEntity<Map<String, Object>> detailedHealthCheck() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("application", applicationName);
        health.put("environment", activeProfile);
        health.put("version", "1.0.0");
        health.put("apiEndpoints", Map.of(
                "auth", "/api/auth",
                "users", "/api/users",
                "oauth2", "/oauth2/authorization/google"
        ));
        
        return ResponseEntity.ok(health);
    }
}