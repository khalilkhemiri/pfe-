package com.example.jwt_demo.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;
import java.util.List;

@Document("taches")
@Getter
@Setter
public class Tache {
    @Id
    private String id;

    private List<String> stagiairesIds;
    private String titre;
    private String description;
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    private Date dateDebut;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    private Date dateFin;

    private StatutTache statut = StatutTache.EN_ATTENTE;
    private Date createdAt = new Date();
    private RapportRendu rapportRendu;
}
