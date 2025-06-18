package com.example.jwt_demo.service;

import com.example.jwt_demo.model.ChatMessage;
import com.example.jwt_demo.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public ChatMessage saveMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getConversation(String currentUserId, String otherUserId) {
        return chatMessageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                currentUserId, otherUserId, currentUserId, otherUserId);
    }

    public List<ChatMessage> getUnreadMessages(String userId) {
        return chatMessageRepository.findByReceiverIdAndReadFalse(userId);
    }

    public void markMessagesAsRead(String currentUserId, String senderId) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findByReceiverIdAndSenderIdAndReadFalse(currentUserId, senderId);
        unreadMessages.forEach(message -> {
            message.setRead(true);
            chatMessageRepository.save(message);
        });
    }
}