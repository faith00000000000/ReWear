package com.rewear.backend.security;

import com.rewear.backend.user.model.User;
import com.rewear.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.jwt.access-token-expiry}")
    private long accessTokenExpiryMs;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        try {
            log.info("OAuth2 authentication successful");
            
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            String email = oAuth2User.getAttribute("email");
            String fullName = oAuth2User.getAttribute("name");
            String picture = oAuth2User.getAttribute("picture");

            if (email == null || email.isBlank()) {
                log.error("OAuth2 user email is missing");
                redirectToError(request, response, "oauth_error", "Email not provided by OAuth provider");
                return;
            }

            final String normalizedEmail = email.toLowerCase().trim();
            log.debug("Processing OAuth2 user: {}", normalizedEmail);

            // Upsert user — create if first login, otherwise leave existing record
            User user = userRepository.findByEmail(normalizedEmail).orElseGet(() -> {
                log.info("Creating new OAuth2 user: {}", normalizedEmail);
                User newUser = User.builder()
                        .email(normalizedEmail)
                        .fullName(fullName != null ? fullName : "")
                        .profilePictureUrl(picture)
                        .password("")          // no password for OAuth users
                        .isActive(true)
                        .oauthProvider("google")
                        .build();
                return userRepository.save(newUser);
            });

            if (!user.getIsActive()) {
                log.warn("OAuth2 login attempt with deactivated account: {}", normalizedEmail);
                redirectToError(request, response, "account_deactivated", "Your account has been deactivated");
                return;
            }

            // Update profile picture in case it changed
            if (picture != null && !picture.equals(user.getProfilePictureUrl())) {
                log.debug("Updating profile picture for user: {}", normalizedEmail);
                user.setProfilePictureUrl(picture);
                userRepository.save(user);
            }

            // Generate tokens
            String accessToken = jwtService.generateAccessToken(normalizedEmail, Map.of("userId", user.getId()));
            String refreshToken = jwtService.generateRefreshToken(normalizedEmail);
//            long expiresIn = jwtService.getTokenExpiryTime(accessToken);
            long   expiresIn    = accessTokenExpiryMs / 1000; // ms → seconds

            log.info("OAuth2 tokens generated successfully for user: {}", normalizedEmail);

            // Build redirect URL with parameters
            String redirectUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl + "/oauth2/callback")
                    .queryParam("accessToken", accessToken)
                    .queryParam("refreshToken", refreshToken)
                    .queryParam("userId", user.getId())
                    .queryParam("fullName", URLEncoder.encode(fullName != null ? fullName : "", StandardCharsets.UTF_8))
                    .queryParam("email", normalizedEmail)
                    .queryParam("picture", picture != null ? URLEncoder.encode(picture, StandardCharsets.UTF_8) : "")
                    .queryParam("expiresIn", expiresIn / 1000)
                    .build().toUriString();

            log.debug("Redirecting OAuth2 user to: {}/oauth2/callback", frontendUrl);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);

        } catch (Exception e) {
            log.error("Error handling OAuth2 authentication success", e);
            try {
                redirectToError(request, response, "server_error", "An error occurred during authentication");
            } catch (IOException ioException) {
                log.error("Error redirecting to error page", ioException);
            }
        }
    }

    private void redirectToError(
            HttpServletRequest request,
            HttpServletResponse response,
            String errorCode,
            String errorMessage
    ) throws IOException {
        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("error", errorCode)
                .queryParam("errorMessage", URLEncoder.encode(errorMessage, StandardCharsets.UTF_8))
                .build().toUriString();

        log.warn("Redirecting to error page: {}", redirectUrl);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
