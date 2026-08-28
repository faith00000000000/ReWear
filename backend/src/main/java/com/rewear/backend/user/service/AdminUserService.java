package com.rewear.backend.user.service;

import com.rewear.backend.exception.ResourceNotFoundException;
import com.rewear.backend.user.dto.response.AdminUserResponseDto;
import com.rewear.backend.user.enums.UserStatus;
import com.rewear.backend.user.mapper.AdminUserMapper;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.repository.UserRepository;
// TODO: adjust these two imports to match your actual packages/repositories
import com.rewear.backend.listing.repository.ListingRepository;
import com.rewear.backend.order.repository.OrderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final com.rewear.backend.notification.service.NotificationService notificationService;

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final OrderRepository orderRepository;
    private final AdminUserMapper adminUserMapper;

    /**
     * Lists every user with the admin view model. Runs a count query per
     * user (fine for an admin panel at this scale) — if the user base grows
     * large, swap this for a single GROUP BY aggregate query instead.
     */
    @Transactional(readOnly = true)
    public List<AdminUserResponseDto> getAllUsersForAdmin() {
        return userRepository.findAll()
                .stream()
                .map(this::mapWithCounts)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUserResponseDto getUserForAdmin(Long id) {
        return mapWithCounts(findUserById(id));
    }

    @Transactional
    public AdminUserResponseDto banUser(Long id, String reason) {
        User user = findUserById(id);

        if (user.getStatus() == UserStatus.BANNED) {
            throw new IllegalStateException("User is already banned");
        }

        user.setStatus(UserStatus.BANNED);
        user.setBanReason(reason);
        user.setBannedAt(LocalDateTime.now());
        user.setIsActive(false); // banned accounts must not be able to log in

        User saved = userRepository.save(user);
        notificationService.notifyUser(id, "account-ban:" + java.util.UUID.randomUUID(),
            com.rewear.backend.notification.enums.NotificationType.ACCOUNT,
            "Account restricted", "Your account has been restricted. Contact support for assistance.", "/notifications");
        log.info("User {} banned (reason: {})", id, reason);
        return mapWithCounts(saved);
    }

    @Transactional
    public AdminUserResponseDto unbanUser(Long id) {
        User user = findUserById(id);

        boolean wasBanned = user.getStatus() == UserStatus.BANNED;
        user.setStatus(UserStatus.ACTIVE);
        user.setBanReason(null);
        user.setBannedAt(null);
        user.setIsActive(true);

        User saved = userRepository.save(user);
        if (wasBanned) notificationService.notifyUser(id, "account-unban:" + java.util.UUID.randomUUID(),
            com.rewear.backend.notification.enums.NotificationType.ACCOUNT,
            "Account restored", "Your account access has been restored.", "/notifications");
        log.info("User {} unbanned", id);
        return mapWithCounts(saved);
    }

    private AdminUserResponseDto mapWithCounts(User user) {
        // TODO: rename these to match your actual repository method names.
        // Assumes Listing has a `seller` ManyToOne User, and Order has a
        // `buyer` ManyToOne User, so Spring Data can derive these by
        // property-path (SellerId / BuyerId).
        int totalListings = (int) listingRepository.countBySellerId(user.getId());
        int totalOrders = (int) orderRepository.countByBuyerId(user.getId());

        return adminUserMapper.toAdminResponseDto(user, totalOrders, totalListings);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with id: {}", id);
                    return new ResourceNotFoundException("User not found");
                });
    }
}