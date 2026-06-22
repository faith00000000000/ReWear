package com.rewear.backend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rewear.backend.user.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository <User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
}
