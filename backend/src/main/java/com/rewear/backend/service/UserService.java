package com.rewear.backend.service;

import com.rewear.backend.dto.request.UserRequestDto;
import com.rewear.backend.dto.request.UserUpdateRequestDto;
import com.rewear.backend.dto.response.UserResponseDto;
import com.rewear.backend.exception.ResourceAlreadyExistsException;
import com.rewear.backend.exception.ResourceNotFoundException;
import com.rewear.backend.mapper.UserMapper;
import com.rewear.backend.model.User;
import com.rewear.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional
    public UserResponseDto signup(UserRequestDto requestDto) {
        String normalizedEmail = normalizeEmail(requestDto.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResourceAlreadyExistsException("Email is already registered");
        }

        User user = userMapper.toEntity(requestDto);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        return userMapper.toResponseDto(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponseDto getUserById(Long id) {
        User user = findUserById(id);
        return userMapper.toResponseDto(user);
    }

    @Transactional
    public UserResponseDto updateUser(Long id, UserUpdateRequestDto requestDto) {
        User user = findUserById(id);

        if (requestDto.getFullName() != null && !requestDto.getFullName().isBlank()) {
            user.setFullName(requestDto.getFullName().trim());
        }

        if (requestDto.getEmail() != null && !requestDto.getEmail().isBlank()) {
            String normalizedEmail = normalizeEmail(requestDto.getEmail());

            if (!user.getEmail().equals(normalizedEmail) && userRepository.existsByEmail(normalizedEmail)) {
                throw new ResourceAlreadyExistsException("Email is already registered");
            }

            user.setEmail(normalizedEmail);
        }

        if (requestDto.getPassword() != null && !requestDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toResponseDto(updatedUser);
    }

    @Transactional
    public UserResponseDto deactivateUser(Long id) {
        User user = findUserById(id);
        user.setIsActive(false);

        User updatedUser = userRepository.save(user);
        return userMapper.toResponseDto(updatedUser);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
