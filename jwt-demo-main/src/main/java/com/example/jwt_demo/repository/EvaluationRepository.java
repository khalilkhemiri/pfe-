package com.example.jwt_demo.repository;

import com.example.jwt_demo.model.Evaluation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends MongoRepository<Evaluation, String> {
    
    // Trouver toutes les évaluations d'un stagiaire
    List<Evaluation> findByStagiaireIdOrderByDateEvaluationDesc(String stagiaireId);
    
    // Trouver toutes les évaluations d'un tuteur
    List<Evaluation> findByTuteurIdOrderByDateEvaluationDesc(String tuteurId);
    
    // Trouver les évaluations d'un stagiaire par un tuteur spécifique
    List<Evaluation> findByStagiaireIdAndTuteurIdOrderByDateEvaluationDesc(String stagiaireId, String tuteurId);
    
    // Trouver les évaluations par statut
    List<Evaluation> findByStatut(String statut);
    
    // Trouver les évaluations d'un stagiaire par statut
    List<Evaluation> findByStagiaireIdAndStatutOrderByDateEvaluationDesc(String stagiaireId, String statut);
    
    // Compter les évaluations d'un stagiaire
    long countByStagiaireId(String stagiaireId);
    
    // Compter les évaluations d'un tuteur
    long countByTuteurId(String tuteurId);
} 