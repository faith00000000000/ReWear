package com.rewear.backend.wallet.controller;
import com.rewear.backend.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.Principal;
@RestController @RequiredArgsConstructor
public class WalletController {
 private final WalletService service;
 private final com.rewear.backend.wallet.service.AdminRefundService refunds;
 @PostMapping("/api/admin/earnings/refunds/{id}/confirm") public void confirmRefund(Principal p,@PathVariable Long id,@Valid @RequestBody com.rewear.backend.wallet.service.AdminRefundService.Confirmation body){refunds.confirm(email(p),id,body);}
 private String email(Principal p){return p==null?null:p.getName();}
 @GetMapping("/api/seller/earnings") public WalletService.Wallet wallet(Principal p){return service.wallet(email(p));}
 @PostMapping("/api/seller/earnings/withdrawals") public WalletService.WithdrawalView request(Principal p,@Valid @RequestBody WalletService.Request body){return service.request(email(p),body);}
 @PostMapping("/api/seller/earnings/withdrawals/{id}/cancel") public void cancel(Principal p,@PathVariable Long id){service.cancel(email(p),id);}
 @GetMapping("/api/admin/earnings/settlement") public WalletService.Settlement settlement(Principal p){return service.settlement(email(p));}
}
