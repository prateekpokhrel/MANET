package com.manet.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                // Disable CSRF for REST APIs
                .csrf(csrf -> csrf.disable())

                // We are building a REST API
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Development mode: allow our API endpoints
                .authorizeHttpRequests(auth -> auth

                        // MANET APIs
                        .requestMatchers("/api/**").permitAll()

                        // Allow basic application access
                        .requestMatchers("/").permitAll()

                        // Everything else
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}