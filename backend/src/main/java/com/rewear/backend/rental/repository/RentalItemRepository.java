package com.rewear.backend.rental.repository;
import com.rewear.backend.order.modal.OrderItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface RentalItemRepository extends JpaRepository<OrderItem,Long> {
 @Query("select i from OrderItem i join fetch i.order o join fetch o.buyer where o.status='CONFIRMED' and (o.buyer.id=:userId or i.sellerId=:userId or (i.sellerId is null and exists (select l.id from Listing l where l.id=i.listingId and l.seller.id=:userId))) and i.rentalStartIso is not null order by i.id desc")
 List<OrderItem> inbox(@Param("userId") Long userId);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select i from OrderItem i where i.id=:id")
 Optional<OrderItem> lockItem(@Param("id") Long id);
 @Query("select count(i) from OrderItem i where i.listingId=:listingId and i.id<>:itemId and i.order.status='CONFIRMED' and (i.rentalStartIso is null or i.rentalState is null or i.rentalState='ACTIVE')")
 long otherReservations(@Param("listingId") Long listingId,@Param("itemId") Long itemId);
}
