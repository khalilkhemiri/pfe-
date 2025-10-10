package com.example.jwt_demo;

import com.example.jwt_demo.controller.ChatController;
import com.example.jwt_demo.model.ChatMessage;
import com.example.jwt_demo.model.User;
import com.example.jwt_demo.service.ChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ChatControllerTest {

    private MockMvc mockMvc;
    private ChatService chatService;
    private ChatController chatController;

    @BeforeEach
    void setUp() {
        chatService = Mockito.mock(ChatService.class);
        chatController = new ChatController();
        
        // Inject chatService via reflection
        try {
            var field = ChatController.class.getDeclaredField("chatService");
            field.setAccessible(true);
            field.set(chatController, chatService);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        
        mockMvc = MockMvcBuilders.standaloneSetup(chatController).build();
    }

    @Test
    void sendMessageReturnsSavedMessage() throws Exception {
        ChatMessage message = new ChatMessage();
        message.setId("msg1");
        message.setContent("Hello");
        
        User sender = new User();
        sender.setId("user1");
        sender.setUsername("alice");
        
        User receiver = new User();
        receiver.setId("user2");
        receiver.setUsername("bob");
        
        message.setSender(sender);
        message.setReceiver(receiver);
        
        when(chatService.saveMessage(any(ChatMessage.class))).thenReturn(message);
        
        String json = "{\"id\":\"msg1\",\"content\":\"Hello\",\"sender\":{\"id\":\"user1\",\"username\":\"alice\"},\"receiver\":{\"id\":\"user2\",\"username\":\"bob\"}}";
        
        mockMvc.perform(post("/api/chat/send")
                        .contentType("application/json")
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("msg1"))
                .andExpect(jsonPath("$.content").value("Hello"));
    }

    @Test
    void getConversationReturnsMessages() throws Exception {
        ChatMessage msg1 = new ChatMessage();
        msg1.setId("msg1");
        msg1.setContent("Hello");
        
        ChatMessage msg2 = new ChatMessage();
        msg2.setId("msg2");
        msg2.setContent("Hi there");
        
        List<ChatMessage> messages = Arrays.asList(msg1, msg2);
        
        when(chatService.getConversation("user1", "user2")).thenReturn(messages);
        
        mockMvc.perform(get("/api/chat/conversation/user1/user2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value("msg1"))
                .andExpect(jsonPath("$[1].id").value("msg2"));
    }

    @Test
    void getUnreadMessagesReturnsUnreadMessages() throws Exception {
        ChatMessage msg1 = new ChatMessage();
        msg1.setId("msg1");
        msg1.setContent("Unread message");
        msg1.setRead(false);
        
        List<ChatMessage> unreadMessages = Arrays.asList(msg1);
        
        when(chatService.getUnreadMessages("user1")).thenReturn(unreadMessages);
        
        mockMvc.perform(get("/api/chat/unread/user1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("msg1"))
                .andExpect(jsonPath("$[0].read").value(false));
    }

    @Test
    void markMessagesAsReadReturnsOk() throws Exception {
        mockMvc.perform(post("/api/chat/read/user1/user2"))
                .andExpect(status().isOk());
        
        Mockito.verify(chatService).markMessagesAsRead("user1", "user2");
    }
}