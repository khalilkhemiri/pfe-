package com.example.jwt_demo.controller;

import com.example.jwt_demo.model.ChatMessage;
import com.example.jwt_demo.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage message) {
        ChatMessage savedMessage = chatService.saveMessage(message);
        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping("/conversation/{currentUserId}/{otherUserId}")
    public ResponseEntity<List<ChatMessage>> getConversation(
            @PathVariable String currentUserId,
            @PathVariable String otherUserId) {
        List<ChatMessage> messages = chatService.getConversation(currentUserId, otherUserId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<ChatMessage>> getUnreadMessages(@PathVariable String userId) {
        List<ChatMessage> messages = chatService.getUnreadMessages(userId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/read/{currentUserId}/{senderId}")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable String currentUserId,
            @PathVariable String senderId) {
        chatService.markMessagesAsRead(currentUserId, senderId);
        return ResponseEntity.ok().build();
    }
}
