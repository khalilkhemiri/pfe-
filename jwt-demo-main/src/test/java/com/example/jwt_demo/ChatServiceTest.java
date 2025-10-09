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
    ChatMessageRepository chatMessageRepository;
    ChatService chatService;

    @BeforeEach
    void setUp() {
        chatMessageRepository = Mockito.mock(ChatMessageRepository.class);
        chatService = new ChatService();
        try {
            var f = ChatService.class.getDeclaredField("chatMessageRepository");
            f.setAccessible(true);
            f.set(chatService, chatMessageRepository);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void saveMessageDelegates() {
        ChatMessage m = new ChatMessage(); m.setId("c1");
        when(chatMessageRepository.save(m)).thenReturn(m);
        var saved = chatService.saveMessage(m);
        assertEquals("c1", saved.getId());
    }

    @Test
    void markMessagesAsReadSavesEach() {
        ChatMessage m1 = new ChatMessage(); m1.setId("1"); m1.setRead(false);
        when(chatMessageRepository.findByReceiverIdAndSenderIdAndReadFalse("u2","u1")).thenReturn(List.of(m1));

        chatService.markMessagesAsRead("u2","u1");

        assertTrue(m1.isRead());
        verify(chatMessageRepository).save(m1);
    }
}
