package com.rewear.backend.notification.repository;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.enums.Role;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface NotificationRecipientRepository extends JpaRepository<User,Long> {
 Optional<User> findByEmail(String email);
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select u from User u where u.id=:id")
 Optional<User> lockRecipient(@Param("id") Long id);
 @Query("select u.id from User u where u.role=:role and u.isActive=true order by u.id")
 List<Long> recipientsByRole(@Param("role") Role role);
}
