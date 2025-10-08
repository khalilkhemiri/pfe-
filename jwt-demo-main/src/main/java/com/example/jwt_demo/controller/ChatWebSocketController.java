package com.example.jwt_demo.controller;

import com.example.jwt_demo.model.ChatMessage;
import com.example.jwt_demo.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // Sauvegarder le message dans la base de données
        ChatMessage savedMessage = chatService.saveMessage(chatMessage);
        
        // Envoyer le message au destinataire spécifique
        messagingTemplate.convertAndSendToUser(
            chatMessage.getReceiver().getId(),
            "/queue/messages",
            savedMessage
        );

        // Envoyer le message à l'expéditeur pour confirmation
        messagingTemplate.convertAndSendToUser(
            chatMessage.getSender().getId(),
            "/queue/messages",
            savedMessage
        );
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Ajouter l'utilisateur à la session WebSocket
        headerAccessor.getSessionAttributes().put("userId", chatMessage.getSender().getId());
        
        // Envoyer un message de confirmation
        messagingTemplate.convertAndSendToUser(
            chatMessage.getSender().getId(),
            "/queue/messages",
            chatMessage
        );
    }
} 