package com.example.jwt_demo;

import com.example.jwt_demo.security.WebSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class WebSecurityConfigTest {

    @Test
    void passwordEncoderIsBCrypt() {
        WebSecurityConfig cfg = new WebSecurityConfig();
        PasswordEncoder encoder = cfg.passwordEncoder();
        assertNotNull(encoder);
        assertTrue(encoder instanceof BCryptPasswordEncoder);
    }
}
