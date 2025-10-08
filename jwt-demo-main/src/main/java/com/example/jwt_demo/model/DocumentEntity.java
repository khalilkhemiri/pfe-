package com.example.jwt_demo.model;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "documents")
public class DocumentEntity {
    @Id
    private String id;
    private String stagiaireId;
    private String type; // attestation, convention, rapport, autre
    private String fileName;
    private String url; // URL Cloudinary
    private String status; // pending, uploaded, rejected
}
