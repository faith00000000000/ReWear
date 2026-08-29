package com.rewear.backend.security;

import com.rewear.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.rewear.backend.user.model.User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> {
                    log.warn("Authentication failed — no account for email: {}", email);
                    return new UsernameNotFoundException("Invalid credentials");
                });

        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .disabled(!Boolean.TRUE.equals(user.getIsActive()))
                .accountLocked(user.getStatus()==com.rewear.backend.user.enums.UserStatus.BANNED || (user.getSuspendedUntil()!=null && user.getSuspendedUntil().isAfter(java.time.LocalDateTime.now())))
                .authorities("ROLE_" + user.getRole().name())
                .build();
    }
}