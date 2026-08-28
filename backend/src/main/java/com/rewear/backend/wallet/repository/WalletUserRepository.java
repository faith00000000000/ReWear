package com.rewear.backend.wallet.repository;
import com.rewear.backend.user.model.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface WalletUserRepository extends JpaRepository<User,Long> {
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select u from User u where u.id=:id")
 Optional<User> lockUser(@Param("id") Long id);
}
