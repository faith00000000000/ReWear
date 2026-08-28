package com.rewear.backend.notification.repository;
import com.rewear.backend.notification.model.NotificationOutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NotificationOutboxRepository extends JpaRepository<NotificationOutboxEvent,Long> {
 List<NotificationOutboxEvent> findTop50ByDeliveredAtIsNullOrderByIdAsc();
}
