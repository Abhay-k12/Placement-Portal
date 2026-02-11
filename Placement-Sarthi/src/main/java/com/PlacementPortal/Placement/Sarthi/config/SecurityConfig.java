package com.PlacementPortal.Placement.Sarthi.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import com.PlacementPortal.Placement.Sarthi.service.CustomUserDetailsService;

import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        // ===== PUBLIC: Static resources (HTML, CSS, JS, images) =====
                        .requestMatchers(
                                "/", "/index.html", "/login_page.html",
                                "/student_dashboard.html", "/original-admin.html", "/company_dashboard.html",
                                "/css/**", "/js/**", "/images/**", "/fonts/**",
                                "/favicon.ico"
                        ).permitAll()

                        // ===== PUBLIC: Login/logout/session check =====
                        .requestMatchers("/api/login", "/api/logout", "/api/check-session").permitAll()
                        .requestMatchers("/api/*/forgot-password").permitAll()

                        // ===== PUBLIC: Contact form =====
                        .requestMatchers("/api/messages/contact").permitAll()

                        // ===== PROTECTED: All other API endpoints need authentication =====
                        .requestMatchers("/api/**").authenticated()

                        // ===== Everything else (non-API): allow =====
                        .anyRequest().permitAll()
                )

                // Disable Spring Security's default login page
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // Custom logout
                .logout(logout -> logout
                        .logoutUrl("/api/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_OK);
                            new ObjectMapper().writeValue(response.getOutputStream(),
                                    Map.of("success", true, "message", "Logged out successfully"));
                        })
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                )

                // Return JSON for auth errors, NOT redirects
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            new ObjectMapper().writeValue(response.getOutputStream(),
                                    Map.of("success", false, "message", "Please login first"));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            new ObjectMapper().writeValue(response.getOutputStream(),
                                    Map.of("success", false, "message", "Access denied"));
                        })
                );

        return http.build();
    }
}