package com.rewear.backend.admin.dashboard.controller;
import com.rewear.backend.admin.dashboard.dto.AdminDashboardResponse;import com.rewear.backend.admin.dashboard.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;import org.springframework.web.bind.annotation.*;import java.security.Principal;
@RestController @RequestMapping("/api/admin/dashboard") @RequiredArgsConstructor
public class AdminDashboardController {private final AdminDashboardService service;@GetMapping public AdminDashboardResponse overview(Principal p){return service.overview(p==null?null:p.getName());}}
