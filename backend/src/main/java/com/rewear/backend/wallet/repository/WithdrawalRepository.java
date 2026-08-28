package com.rewear.backend.wallet.repository;
import com.rewear.backend.wallet.model.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface WithdrawalRepository extends JpaRepository<Withdrawal,Long> {
 List<Withdrawal> findBySellerIdOrderByIdDesc(Long sellerId);
 Optional<Withdrawal> findBySellerIdAndRequestKey(Long sellerId,String requestKey);
}
