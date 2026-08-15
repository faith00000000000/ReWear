// package com.rewear.backend.security;

// import com.rewear.backend.user.model.User;
// import com.rewear.backend.user.repository.UserRepository;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// /**
//  * Bridges our User entity to Spring Security. This is what your
//  * AuthenticationManager/DaoAuthenticationProvider calls during login,
//  * and what your JWT filter calls when validating a token on each request.
//  *
//  * Intentionally separate from UserService, which only deals in DTOs —
//  * Security needs the entity (for the password hash + role), and that
//  * needs to stay out of the DTO-facing service layer.
//  */
// @Slf4j
// @Service
// @RequiredArgsConstructor
// public class CustomUserDetailsService implements UserDetailsService {

//     private final UserRepository userRepository;

//     @Override
//     @Transactional(readOnly = true)
//     public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
//         User user = userRepository.findByEmail(email.toLowerCase().trim())
//                 .orElseThrow(() -> {
//                     log.warn("Authentication failed — no account for email: {}", email);
//                     // Deliberately vague, per your existing auth error convention
//                     return new UsernameNotFoundException("Invalid credentials");
//                 });

//         return new UserPrincipal(user);
//     }
// }