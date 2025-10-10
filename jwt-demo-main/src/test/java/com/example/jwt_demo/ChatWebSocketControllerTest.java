package com.example.jwt_demo;

import com.example.jwt_demo.controller.ChatWebSocketController;
import com.example.jwt_demo.model.ChatMessage;
import com.example.jwt_demo.model.User;
import com.example.jwt_demo.service.ChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ChatWebSocketControllerTest {

    private ChatWebSocketController chatWebSocketController;
    private SimpMessagingTemplate messagingTemplate;
    private ChatService chatService;
    private SimpMessageHeaderAccessor headerAccessor;

    @BeforeEach
    void setUp() {
        messagingTemplate = Mockito.mock(SimpMessagingTemplate.class);
        chatService = Mockito.mock(ChatService.class);
        headerAccessor = Mockito.mock(SimpMessageHeaderAccessor.class);
        
        chatWebSocketController = new ChatWebSocketController();
        
        // Inject dependencies via reflection
        try {
            var messagingField = ChatWebSocketController.class.getDeclaredField("messagingTemplate");
            messagingField.setAccessible(true);
            messagingField.set(chatWebSocketController, messagingTemplate);
            
            var chatServiceField = ChatWebSocketController.class.getDeclaredField("chatService");
            chatServiceField.setAccessible(true);
            chatServiceField.set(chatWebSocketController, chatService);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void sendMessageSavesAndSendsToBothUsers() {
        // Arrange
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setContent("Hello");
        
        User sender = new User();
        sender.setId("user1");
        sender.setUsername("alice");
        
        User receiver = new User();
        receiver.setId("user2");
        receiver.setUsername("bob");
        
        chatMessage.setSender(sender);
        chatMessage.setReceiver(receiver);
        
        ChatMessage savedMessage = new ChatMessage();
        savedMessage.setId("msg1");
        savedMessage.setContent("Hello");
        savedMessage.setSender(sender);
        savedMessage.setReceiver(receiver);
        
        when(chatService.saveMessage(chatMessage)).thenReturn(savedMessage);
        
        // Act
        chatWebSocketController.sendMessage(chatMessage);
        
        // Assert
        verify(chatService).saveMessage(chatMessage);
        verify(messagingTemplate).convertAndSendToUser(
            eq("user2"), 
            eq("/queue/messages"), 
            eq(savedMessage)
        );
        verify(messagingTemplate).convertAndSendToUser(
            eq("user1"), 
            eq("/queue/messages"), 
            eq(savedMessage)
        );
    }

    @Test
    void addUserSetsSessionAttributeAndSendsConfirmation() {
        // Arrange
        ChatMessage chatMessage = new ChatMessage();
        User sender = new User();
        sender.setId("user1");
        sender.setUsername("alice");
        chatMessage.setSender(sender);
        
        Map<String, Object> sessionAttributes = new HashMap<>();
        when(headerAccessor.getSessionAttributes()).thenReturn(sessionAttributes);
        
        // Act
        chatWebSocketController.addUser(chatMessage, headerAccessor);
        
        // Assert
        verify(headerAccessor).getSessionAttributes();
        verify(messagingTemplate).convertAndSendToUser(
            eq("user1"), 
            eq("/queue/messages"), 
            eq(chatMessage)
        );
        
        // Verify that userId was added to session attributes
        assertEquals("user1", sessionAttributes.get("userId"));
    }

    @Test
    void addUserWithNullSessionAttributes() {
        // Arrange
        ChatMessage chatMessage = new ChatMessage();
        User sender = new User();
        sender.setId("user1");
        sender.setUsername("alice");
        chatMessage.setSender(sender);
        
        when(headerAccessor.getSessionAttributes()).thenReturn(null);
        
        // Act & Assert - should throw NullPointerException because the controller doesn't handle null session attributes
        assertThrows(NullPointerException.class, () -> {
            chatWebSocketController.addUser(chatMessage, headerAccessor);
        });
        
        verify(headerAccessor).getSessionAttributes();
        // messagingTemplate should not be called because the method throws exception before reaching it
    }
}