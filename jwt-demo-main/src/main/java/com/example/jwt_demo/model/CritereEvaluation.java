package com.example.jwt_demo.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
public class CritereEvaluation {
    private String critereId;
    private String nom;
    private String description;
    private int note; // Note de 1 à 10
    private int poids; // Poids en pourcentage (ex: 25 pour 25%)
    private String icone;

    // Constructeur pour faciliter la création
    public CritereEvaluation(String critereId, int note, int poids) {
        this.critereId = critereId;
        this.note = note;
        this.poids = poids;
    }

    // Constructeur complet
    public CritereEvaluation(String critereId, String nom, String description, int note, int poids, String icone) {
        this.critereId = critereId;
        this.nom = nom;
        this.description = description;
        this.note = note;
        this.poids = poids;
        this.icone = icone;
    }
} 