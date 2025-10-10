package com.example.jwt_demo;

import com.example.jwt_demo.security.AuthEntryPointJwt;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.AuthenticationException;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthEntryPointJwtTest {

    private AuthEntryPointJwt authEntryPointJwt;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private AuthenticationException authException;

    @BeforeEach
    void setUp() {
        authEntryPointJwt = new AuthEntryPointJwt();
        request = Mockito.mock(HttpServletRequest.class);
        response = Mockito.mock(HttpServletResponse.class);
        authException = Mockito.mock(AuthenticationException.class);
    }

    @Test
    void commenceSendsUnauthorizedError() throws IOException {
        // Act
        authEntryPointJwt.commence(request, response, authException);

        // Assert
        verify(response).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
    }

    @Test
    void commenceWithNullRequestSendsUnauthorizedError() throws IOException {
        // Act
        authEntryPointJwt.commence(null, response, authException);

        // Assert
        verify(response).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
    }

    @Test
    void commenceWithNullResponseThrowsException() {
        // Act & Assert
        assertThrows(NullPointerException.class, () -> {
            authEntryPointJwt.commence(request, null, authException);
        });
    }

    @Test
    void commenceWithNullExceptionSendsUnauthorizedError() throws IOException {
        // Act
        authEntryPointJwt.commence(request, response, null);

        // Assert
        verify(response).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
    }

    @Test
    void commenceWithIOExceptionPropagatesException() throws IOException {
        // Arrange
        doThrow(new IOException("Response error")).when(response)
                .sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");

        // Act & Assert
        assertThrows(IOException.class, () -> {
            authEntryPointJwt.commence(request, response, authException);
        });
    }
}