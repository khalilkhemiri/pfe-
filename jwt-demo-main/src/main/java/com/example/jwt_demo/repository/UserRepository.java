package com.example.jwt_demo.repository;

import com.example.jwt_demo.model.User;
import com.example.jwt_demo.model.UserRole;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);
    boolean existsByUsername(String username);
    List<User> findByTuteurId(String tuteurId);
    List<User> findByActiveFalse();
    List<User> findByRole(UserRole role);
    Optional<User> findById(String id);

}