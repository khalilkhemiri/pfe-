package com.example.jwt_demo.model;

import jakarta.persistence.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("stagiaires")
public class Stagiaire {
    @Id
    private String id;
    private String utilisateurId;
    private String niveau;
    private String specialite;
}