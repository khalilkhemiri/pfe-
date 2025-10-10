package com.example.jwt_demo;

import com.example.jwt_demo.security.AuthTokenFilter;
import com.example.jwt_demo.security.JwtUtil;
import com.example.jwt_demo.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthTokenFilterTest {

    private AuthTokenFilter authTokenFilter;
    private JwtUtil jwtUtil;
    private CustomUserDetailsService userDetailsService;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        jwtUtil = Mockito.mock(JwtUtil.class);
        userDetailsService = Mockito.mock(CustomUserDetailsService.class);
        request = Mockito.mock(HttpServletRequest.class);
        response = Mockito.mock(HttpServletResponse.class);
        filterChain = Mockito.mock(FilterChain.class);
        
        authTokenFilter = new AuthTokenFilter();
        
        // Inject dependencies via reflection
        try {
            var jwtField = AuthTokenFilter.class.getDeclaredField("jwtUtils");
            jwtField.setAccessible(true);
            jwtField.set(authTokenFilter, jwtUtil);
            
            var userDetailsField = AuthTokenFilter.class.getDeclaredField("userDetailsService");
            userDetailsField.setAccessible(true);
            userDetailsField.set(authTokenFilter, userDetailsService);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        
        // Clear security context before each test
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternalWithValidTokenSetsAuthentication() throws ServletException, IOException, NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        // Arrange
        String token = "valid.jwt.token";
        String username = "testuser";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.validateJwtToken(token)).thenReturn(true);
        when(jwtUtil.getUsernameFromToken(token)).thenReturn(username);
        
        UserDetails userDetails = User.builder()
                .username(username)
                .password("password")
                .authorities(Collections.emptyList())
                .build();
        
        when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
        
        // Act
        var doFilterMethod = AuthTokenFilter.class.getDeclaredMethod("doFilterInternal", 
                HttpServletRequest.class, HttpServletResponse.class, FilterChain.class);
        doFilterMethod.setAccessible(true);
        doFilterMethod.invoke(authTokenFilter, request, response, filterChain);
        
        // Assert
        verify(filterChain).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(username, SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    void doFilterInternalWithInvalidTokenDoesNotSetAuthentication() throws ServletException, IOException, NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        // Arrange
        String token = "invalid.jwt.token";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.validateJwtToken(token)).thenReturn(false);
        
        // Act
        var doFilterMethod = AuthTokenFilter.class.getDeclaredMethod("doFilterInternal", 
                HttpServletRequest.class, HttpServletResponse.class, FilterChain.class);
        doFilterMethod.setAccessible(true);
        doFilterMethod.invoke(authTokenFilter, request, response, filterChain);
        
        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternalWithNoAuthorizationHeaderDoesNotSetAuthentication() throws ServletException, IOException, NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(null);
        
        // Act
        var doFilterMethod = AuthTokenFilter.class.getDeclaredMethod("doFilterInternal", 
                HttpServletRequest.class, HttpServletResponse.class, FilterChain.class);
        doFilterMethod.setAccessible(true);
        doFilterMethod.invoke(authTokenFilter, request, response, filterChain);
        
        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternalWithMalformedAuthorizationHeaderDoesNotSetAuthentication() throws ServletException, IOException, NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("InvalidFormat token");
        
        // Act
        var doFilterMethod = AuthTokenFilter.class.getDeclaredMethod("doFilterInternal", 
                HttpServletRequest.class, HttpServletResponse.class, FilterChain.class);
        doFilterMethod.setAccessible(true);
        doFilterMethod.invoke(authTokenFilter, request, response, filterChain);
        
        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternalWithExceptionContinuesFilterChain() throws ServletException, IOException, NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        // Arrange
        String token = "valid.jwt.token";
        
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.validateJwtToken(token)).thenThrow(new RuntimeException("JWT validation failed"));
        
        // Act
        var doFilterMethod = AuthTokenFilter.class.getDeclaredMethod("doFilterInternal", 
                HttpServletRequest.class, HttpServletResponse.class, FilterChain.class);
        doFilterMethod.setAccessible(true);
        doFilterMethod.invoke(authTokenFilter, request, response, filterChain);
        
        // Assert
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void parseJwtWithValidBearerToken() throws Exception {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Bearer valid.jwt.token");
        
        // Act
        var parseJwtMethod = AuthTokenFilter.class.getDeclaredMethod("parseJwt", HttpServletRequest.class);
        parseJwtMethod.setAccessible(true);
        String result = (String) parseJwtMethod.invoke(authTokenFilter, request);
        
        // Assert
        assertEquals("valid.jwt.token", result);
    }

    @Test
    void parseJwtWithInvalidFormat() throws Exception {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("InvalidFormat token");
        
        // Act
        var parseJwtMethod = AuthTokenFilter.class.getDeclaredMethod("parseJwt", HttpServletRequest.class);
        parseJwtMethod.setAccessible(true);
        String result = (String) parseJwtMethod.invoke(authTokenFilter, request);
        
        // Assert
        assertNull(result);
    }

    @Test
    void parseJwtWithNullHeader() throws Exception {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(null);
        
        // Act
        var parseJwtMethod = AuthTokenFilter.class.getDeclaredMethod("parseJwt", HttpServletRequest.class);
        parseJwtMethod.setAccessible(true);
        String result = (String) parseJwtMethod.invoke(authTokenFilter, request);
        
        // Assert
        assertNull(result);
    }
}