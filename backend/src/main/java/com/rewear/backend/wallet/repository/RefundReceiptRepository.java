package com.rewear.backend.wallet.repository;
import com.rewear.backend.wallet.model.RefundReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface RefundReceiptRepository extends JpaRepository<RefundReceipt,Long> {
 Optional<RefundReceipt> findByItemId(Long itemId);
 boolean existsByGatewayAndProviderReference(String gateway,String providerReference);
}
