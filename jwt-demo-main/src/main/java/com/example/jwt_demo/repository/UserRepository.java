package com.example.jwt_demo.repository;

import com.example.jwt_demo.model.User;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);
    boolean existsByUsername(String username);
    List<User> findByTuteurId(String tuteurId);
    List<User> findByActiveFalse();
}