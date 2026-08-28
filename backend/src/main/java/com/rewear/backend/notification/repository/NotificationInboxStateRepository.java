package com.rewear.backend.notification.repository;
import com.rewear.backend.notification.model.NotificationInboxState;
import org.springframework.data.jpa.repository.JpaRepository;
public interface NotificationInboxStateRepository extends JpaRepository<NotificationInboxState,Long> {
 @Override
 @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 java.util.Optional<NotificationInboxState> findById(Long id);
}
