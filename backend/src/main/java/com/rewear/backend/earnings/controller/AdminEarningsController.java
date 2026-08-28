package com.rewear.backend.earnings.controller;
import com.rewear.backend.earnings.dto.EarningsResponse;
import com.rewear.backend.earnings.service.EarningsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.security.Principal;
@RestController @RequestMapping("/api/admin/earnings") @RequiredArgsConstructor
public class AdminEarningsController {
 private final EarningsService service;
 @GetMapping public EarningsResponse dashboard(Principal principal,@RequestParam(defaultValue="all") String type,
  @RequestParam(defaultValue="") String search,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size) {
  if(principal==null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
  return service.dashboard(principal.getName(),type,search,page,size);
 }
}
