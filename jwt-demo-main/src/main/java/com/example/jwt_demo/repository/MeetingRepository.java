package com.example.jwt_demo.repository;

import com.example.jwt_demo.model.Meeting;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MeetingRepository extends MongoRepository<Meeting, String> {
    List<Meeting> findByStagiaireId(String stagiaireId);

}
