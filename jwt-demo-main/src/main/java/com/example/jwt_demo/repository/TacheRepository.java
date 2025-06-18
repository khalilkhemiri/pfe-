package com.example.jwt_demo.repository;

import com.example.jwt_demo.model.Tache;
import com.example.jwt_demo.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TacheRepository extends MongoRepository<Tache, String> {
    List<Tache> findByStagiairesIds(String stagiaireId);

}
