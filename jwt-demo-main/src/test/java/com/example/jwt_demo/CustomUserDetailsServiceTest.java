package com.example.jwt_demo;

import com.example.jwt_demo.model.User;
import com.example.jwt_demo.repository.UserRepository;
import com.example.jwt_demo.service.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CustomUserDetailsServiceTest {

    UserRepository userRepository;
    JavaMailSender mailSender;
    CustomUserDetailsService service;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        mailSender = Mockito.mock(JavaMailSender.class);
        service = new CustomUserDetailsService();

        // inject mocked fields via reflection
        try {
            var repoField = CustomUserDetailsService.class.getDeclaredField("userRepository");
            repoField.setAccessible(true);
            repoField.set(service, userRepository);

            var mailField = CustomUserDetailsService.class.getDeclaredField("mailSender");
            mailField.setAccessible(true);
            mailField.set(service, mailSender);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void loadUserByUsernameFound() {
        User u = new User();
        u.setUsername("alice");
        u.setPassword("secret");
        when(userRepository.findByUsername("alice")).thenReturn(u);

        UserDetails ud = service.loadUserByUsername("alice");
        assertEquals("alice", ud.getUsername());
        assertEquals("secret", ud.getPassword());
    }

    @Test
    void loadUserByUsernameNotFound() {
        when(userRepository.findByUsername("bob")).thenReturn(null);
        assertThrows(UsernameNotFoundException.class, () -> service.loadUserByUsername("bob"));
    }

    @Test
    void sendAdminNotificationSendsMail() {
        service.sendAdminNotification("new@example.com");
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendTacheAssignedNotificationSendsMail() {
        service.sendTacheAssignedNotification("stagiaire@example.com", "Tâche importante");
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendMeetingInvitationSendsMail() {
        service.sendMeetingInvitation("stagiaire@example.com", "Réunion hebdomadaire", "2024-01-15 10:00", "https://meet.example.com/123");
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendAccountValidatedNotificationSendsMail() {
        service.sendAccountValidatedNotification("user@example.com");
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendAdminNotificationWithNullEmail() {
        // Should not throw exception even with null email
        assertDoesNotThrow(() -> service.sendAdminNotification(null));
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendTacheAssignedNotificationWithEmptyTitre() {
        service.sendTacheAssignedNotification("stagiaire@example.com", "");
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendMeetingInvitationWithNullParameters() {
        // Should not throw exception even with null parameters
        assertDoesNotThrow(() -> service.sendMeetingInvitation(null, null, null, null));
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendAccountValidatedNotificationWithEmptyEmail() {
        service.sendAccountValidatedNotification("");
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void loadUserByUsernameWithEmptyUsername() {
        when(userRepository.findByUsername("")).thenReturn(null);
        assertThrows(UsernameNotFoundException.class, () -> service.loadUserByUsername(""));
    }

    @Test
    void loadUserByUsernameWithNullUsername() {
        when(userRepository.findByUsername(null)).thenReturn(null);
        assertThrows(UsernameNotFoundException.class, () -> service.loadUserByUsername(null));
    }
}
