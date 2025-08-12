package com.example.jwt_demo.repository;

import com.example.jwt_demo.model.Meeting;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MeetingRepository extends MongoRepository<Meeting, String> {
}
