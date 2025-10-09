package com.example.jwt_demo;

import com.example.jwt_demo.model.ChatMessage;
import com.example.jwt_demo.repository.ChatMessageRepository;
import com.example.jwt_demo.service.ChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChatServiceTest {

    ChatMessageRepository repo;
    ChatService service;

    @BeforeEach
    void setUp() {
        repo = Mockito.mock(ChatMessageRepository.class);
        service = new ChatService();
        try {
            var field = ChatService.class.getDeclaredField("chatMessageRepository");
            field.setAccessible(true);
            field.set(service, repo);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void saveMessageDelegatesToRepo() {
        ChatMessage m = new ChatMessage();
        m.setId("c1");
        when(repo.save(m)).thenReturn(m);
        ChatMessage out = service.saveMessage(m);
        assertEquals("c1", out.getId());
        verify(repo).save(m);
    }

    @Test
    void markMessagesAsReadSavesEach() {
        ChatMessage m1 = new ChatMessage(); m1.setId("m1"); m1.setRead(false);
        ChatMessage m2 = new ChatMessage(); m2.setId("m2"); m2.setRead(false);
        when(repo.findByReceiverIdAndSenderIdAndReadFalse("me","you")).thenReturn(List.of(m1, m2));

        service.markMessagesAsRead("me", "you");

        assertTrue(m1.isRead());
        assertTrue(m2.isRead());
        verify(repo, times(2)).save(any(ChatMessage.class));
    }
}
