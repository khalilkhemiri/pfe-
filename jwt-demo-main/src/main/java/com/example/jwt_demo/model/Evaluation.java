package com.example.jwt_demo.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "evaluation")
public class Evaluation {
    @Id
    private String id;

    @Field("stagiaireId")
    private String stagiaireId;

    @Field("tuteurId")
    private String tuteurId;

    @Field("dateEvaluation")
    private LocalDateTime dateEvaluation;

    @Field("criteres")
    private List<CritereEvaluation> criteres;

    @Field("moyenneGlobale")
    private double moyenneGlobale;

    @Field("statut")
    private String statut; // excellent, bon, moyen, insuffisant

    @Field("commentaire")
    private String commentaire;

    @Field("recommandations")
    private String recommandations;

    // Constructeur pour faciliter la création
    public Evaluation(String stagiaireId, String tuteurId, List<CritereEvaluation> criteres, 
                     String commentaire, String recommandations) {
        this.stagiaireId = stagiaireId;
        this.tuteurId = tuteurId;
        this.criteres = criteres;
        this.commentaire = commentaire;
        this.recommandations = recommandations;
        this.dateEvaluation = LocalDateTime.now();
        this.moyenneGlobale = calculerMoyennePonderee();
        this.statut = determinerStatut();
    }

    // Calculer la moyenne pondérée
    private double calculerMoyennePonderee() {
        if (criteres == null || criteres.isEmpty()) return 0.0;
        
        double totalPondere = 0.0;
        double totalPoids = 0.0;
        
        for (CritereEvaluation critere : criteres) {
            totalPondere += critere.getNote() * critere.getPoids();
            totalPoids += critere.getPoids();
        }
        
        return totalPoids > 0 ? Math.round((totalPondere / totalPoids) * 10.0) / 10.0 : 0.0;
    }

    // Déterminer le statut basé sur la moyenne
    private String determinerStatut() {
        if (moyenneGlobale >= 9.0) return "excellent";
        if (moyenneGlobale >= 7.5) return "bon";
        if (moyenneGlobale >= 6.0) return "moyen";
        return "insuffisant";
    }
} 