package com.rewear.backend.rental.controller;
import com.rewear.backend.rental.service.RentalService;
import com.rewear.backend.rental.dto.RentalView;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
@RestController @RequestMapping("/api/rentals") @RequiredArgsConstructor
public class RentalController {
 private final RentalService service;
 private String email(Principal p){return p==null?null:p.getName();}
 @GetMapping public List<RentalView> list(Principal p){return service.list(email(p));}
 @PostMapping("/{id}/cancel") public RentalView cancel(Principal p,@PathVariable Long id){return service.close(email(p),id,true);}
 @PostMapping("/{id}/return") public RentalView returned(Principal p,@PathVariable Long id){return service.close(email(p),id,false);}
}
