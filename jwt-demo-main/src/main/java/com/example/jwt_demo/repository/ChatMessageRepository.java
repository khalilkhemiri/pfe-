package com.example.jwt_demo.repository;

import com.example.jwt_demo.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
        String senderId1, String receiverId1, String senderId2, String receiverId2);
    
    List<ChatMessage> findByReceiverIdAndReadFalse(String receiverId);
    
    List<ChatMessage> findByReceiverIdAndSenderIdAndReadFalse(String receiverId, String senderId);
}
