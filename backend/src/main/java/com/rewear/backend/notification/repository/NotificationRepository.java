package com.rewear.backend.notification.repository;
import com.rewear.backend.notification.model.Notification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.*;
public interface NotificationRepository extends JpaRepository<Notification,Long> {
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 Optional<Notification> findByRecipientIdAndEventKey(Long recipientId,String eventKey);
 long countByRecipientIdAndReadAtIsNull(Long recipientId);
 @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 Optional<Notification> findByIdAndRecipientId(Long id,Long recipientId);
 @Query("select n from Notification n where n.recipientId=:userId and (:cursor is null or n.sequence<:cursor) and (:unread=false or n.readAt is null) order by n.sequence desc")
 List<Notification> inbox(@Param("userId") Long userId,@Param("cursor") Long cursor,@Param("unread") boolean unread,Pageable page);
 @Modifying
 @Query("update Notification n set n.readAt=:now where n.recipientId=:userId and n.sequence<=:watermark and n.readAt is null")
 int markAll(@Param("userId") Long userId,@Param("watermark") long watermark,@Param("now") Instant now);
}
