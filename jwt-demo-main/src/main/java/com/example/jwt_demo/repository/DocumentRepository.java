package com.example.jwt_demo.repository;

import com.example.jwt_demo.model.DocumentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DocumentRepository extends MongoRepository<DocumentEntity, String> {
    List<DocumentEntity> findByStagiaireId(String stagiaireId);
}

