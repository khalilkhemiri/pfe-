package com.example.jwt_demo.model;

import jakarta.persistence.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("tuteurs")
public class Tuteur {
    @Id
    private String id;
    private String utilisateurId;
    private String poste;
}
