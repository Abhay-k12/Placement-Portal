package com.PlacementPortal.Placement.Sarthi.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String home() {
        return "forward:/index.html";
    }

    // Optional: Add other page mappings if needed
    @GetMapping("/admin")
    public String admin() {
        return "forward:/admin_page.html";
    }
}