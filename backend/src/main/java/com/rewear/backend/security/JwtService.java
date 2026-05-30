package com.rewear.backend.security;

import com.rewear.backend.exception.InvalidTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Slf4j
@Service
public class JwtService {

    private final SecretKey key;
    private final long accessTokenExpiry;
    private final long refreshTokenExpiry;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiry}") long accessTokenExpiry,
            @Value("${app.jwt.refresh-token-expiry}") long refreshTokenExpiry
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 characters");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshTokenExpiry = refreshTokenExpiry;
        log.info("JwtService initialized with access token expiry: {}ms, refresh token expiry: {}ms", 
                accessTokenExpiry, refreshTokenExpiry);
    }

    public String generateAccessToken(String email, Map<String, Object> extraClaims) {
        return buildToken(email, extraClaims, accessTokenExpiry);
    }

    public String generateRefreshToken(String email) {
        return buildToken(email, Map.of(), refreshTokenExpiry);
    }

    private String buildToken(String subject, Map<String, Object> claims, long expiry) {
        try {
            long now = System.currentTimeMillis();
            String token = Jwts.builder()
                    .claims(claims)
                    .subject(subject)
                    .issuedAt(new Date(now))
                    .expiration(new Date(now + expiry))
                    .signWith(key)
                    .compact();
            log.debug("Generated JWT token for subject: {}", subject);
            return token;
        } catch (Exception e) {
            log.error("Error generating JWT token", e);
            throw new RuntimeException("Failed to generate token", e);
        }
    }

    public String extractEmail(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getSubject();
        } catch (ExpiredJwtException e) {
            log.warn("Token has expired");
            throw new InvalidTokenException("Token has expired");
        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            throw new InvalidTokenException("Invalid token: " + e.getMessage());
        }
    }

    public Long extractUserId(String token) {
        try {
            Claims claims = parseClaims(token);
            Object userId = claims.get("userId");
            if (userId instanceof Number) {
                return ((Number) userId).longValue();
            }
            return null;
        } catch (Exception e) {
            log.warn("Error extracting userId from token", e);
            return null;
        }
    }

    public boolean isTokenValid(String token, String email) {
        try {
            Claims claims = parseClaims(token);
            return claims.getSubject().equals(email) && !isExpired(token);
        } catch (ExpiredJwtException e) {
            log.debug("Token expired for email: {}", email);
            return false;
        } catch (Exception e) {
            log.debug("Token validation failed for email: {}", email, e);
            return false;
        }
    }

    public long getTokenExpiryTime(String token) {
        try {
            Claims claims = parseClaims(token);
            Date expiration = claims.getExpiration();
            Date now = new Date();
            return Math.max(0, expiration.getTime() - now.getTime());
        } catch (Exception e) {
            log.debug("Error getting token expiry time", e);
            return 0;
        }
    }

    private boolean isExpired(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            return true;
        }
    }

    private Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.debug("JWT token has expired");
            throw e;
        } catch (JwtException e) {
            log.debug("JWT token is invalid: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error parsing JWT token", e);
            throw new JwtException("Error parsing token", e);
        }
    }
}