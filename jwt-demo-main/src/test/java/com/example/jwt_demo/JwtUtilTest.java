package com.example.jwt_demo;

import com.example.jwt_demo.model.UserRole;
import com.example.jwt_demo.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() throws Exception {
        jwtUtil = new JwtUtil();
        // provide a 32+ char secret (HS256 requires a sufficient key length)
        Field secretField = JwtUtil.class.getDeclaredField("jwtSecret");
        secretField.setAccessible(true);
        secretField.set(jwtUtil, "0123456789ABCDEF0123456789ABCDEF");

        Field expField = JwtUtil.class.getDeclaredField("jwtExpirationMs");
        expField.setAccessible(true);
        // 1 hour
        expField.setInt(jwtUtil, 1000 * 60 * 60);

        // initialize the SecretKey
        jwtUtil.init();
    }

    @Test
    void generateAndParseToken() {
        String token = jwtUtil.generateToken("john", "123", UserRole.ADMIN);
        assertNotNull(token);

        assertTrue(jwtUtil.validateJwtToken(token));
        assertEquals("john", jwtUtil.getUsernameFromToken(token));
        assertEquals("123", jwtUtil.getUserIdFromToken(token));
    }

    @Test
    void expiredTokenReturnsFalse() throws Exception {
        JwtUtil temp = new JwtUtil();
        Field secretField = JwtUtil.class.getDeclaredField("jwtSecret");
        secretField.setAccessible(true);
        secretField.set(temp, "0123456789ABCDEF0123456789ABCDEF");

        Field expField = JwtUtil.class.getDeclaredField("jwtExpirationMs");
        expField.setAccessible(true);
        // negative expiration to force an already-expired token
        expField.setInt(temp, -1000);

        temp.init();
        String token = temp.generateToken("jane", "999", UserRole.TUTEUR);
        assertNotNull(token);
        assertFalse(temp.validateJwtToken(token));
    }

    @Test
    void invalidTokenReturnsFalse() {
        assertFalse(jwtUtil.validateJwtToken("not_a_token"));
    }
}
