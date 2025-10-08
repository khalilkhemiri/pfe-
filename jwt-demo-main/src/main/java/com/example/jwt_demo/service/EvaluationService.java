package com.example.jwt_demo.service;

import com.example.jwt_demo.model.Evaluation;
import com.example.jwt_demo.model.CritereEvaluation;
import com.example.jwt_demo.repository.EvaluationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class EvaluationService {

    @Autowired
    private EvaluationRepository evaluationRepository;

    // Créer une nouvelle évaluation
    public Evaluation createEvaluation(Evaluation evaluation) {
        evaluation.setDateEvaluation(LocalDateTime.now());
        return evaluationRepository.save(evaluation);
    }

    // Obtenir toutes les évaluations d'un stagiaire
    public List<Evaluation> getEvaluationsByStagiaire(String stagiaireId) {
        return evaluationRepository.findByStagiaireIdOrderByDateEvaluationDesc(stagiaireId);
    }

    // Obtenir toutes les évaluations d'un tuteur
    public List<Evaluation> getEvaluationsByTuteur(String tuteurId) {
        return evaluationRepository.findByTuteurIdOrderByDateEvaluationDesc(tuteurId);
    }

    // Obtenir une évaluation spécifique
    public Optional<Evaluation> getEvaluationById(String evaluationId) {
        return evaluationRepository.findById(evaluationId);
    }

    // Mettre à jour une évaluation
    public Evaluation updateEvaluation(String evaluationId, Evaluation evaluation) {
        Optional<Evaluation> existingEvaluation = evaluationRepository.findById(evaluationId);
        if (existingEvaluation.isPresent()) {
            Evaluation updatedEvaluation = existingEvaluation.get();
            updatedEvaluation.setCriteres(evaluation.getCriteres());
            updatedEvaluation.setCommentaire(evaluation.getCommentaire());
            updatedEvaluation.setRecommandations(evaluation.getRecommandations());
            updatedEvaluation.setDateEvaluation(LocalDateTime.now());
            // Recalculer la moyenne et le statut
            updatedEvaluation.setMoyenneGlobale(calculerMoyennePonderee(evaluation.getCriteres()));
            updatedEvaluation.setStatut(determinerStatut(updatedEvaluation.getMoyenneGlobale()));
            return evaluationRepository.save(updatedEvaluation);
        }
        return null;
    }

    // Supprimer une évaluation
    public boolean deleteEvaluation(String evaluationId) {
        if (evaluationRepository.existsById(evaluationId)) {
            evaluationRepository.deleteById(evaluationId);
            return true;
        }
        return false;
    }

    // Obtenir les statistiques d'un stagiaire
    public Map<String, Object> getStagiaireStats(String stagiaireId) {
        List<Evaluation> evaluations = getEvaluationsByStagiaire(stagiaireId);
        Map<String, Object> stats = new HashMap<>();
        
        if (evaluations.isEmpty()) {
            stats.put("moyenneGlobale", 0.0);
            stats.put("nombreEvaluations", 0);
            stats.put("meilleureNote", 0.0);
            stats.put("pireNote", 0.0);
            stats.put("evolution", "stable");
            return stats;
        }

        double moyenneGlobale = evaluations.stream()
                .mapToDouble(Evaluation::getMoyenneGlobale)
                .average()
                .orElse(0.0);

        double meilleureNote = evaluations.stream()
                .mapToDouble(Evaluation::getMoyenneGlobale)
                .max()
                .orElse(0.0);

        double pireNote = evaluations.stream()
                .mapToDouble(Evaluation::getMoyenneGlobale)
                .min()
                .orElse(0.0);

        String evolution = "stable";
        if (evaluations.size() >= 2) {
            double derniere = evaluations.get(0).getMoyenneGlobale();
            double avantDerniere = evaluations.get(1).getMoyenneGlobale();
            if (derniere > avantDerniere) {
                evolution = "amélioration";
            } else if (derniere < avantDerniere) {
                evolution = "dégradation";
            }
        }

        stats.put("moyenneGlobale", Math.round(moyenneGlobale * 10.0) / 10.0);
        stats.put("nombreEvaluations", evaluations.size());
        stats.put("meilleureNote", Math.round(meilleureNote * 10.0) / 10.0);
        stats.put("pireNote", Math.round(pireNote * 10.0) / 10.0);
        stats.put("evolution", evolution);

        return stats;
    }

    // Obtenir les statistiques d'un tuteur
    public Map<String, Object> getTuteurStats(String tuteurId) {
        List<Evaluation> evaluations = getEvaluationsByTuteur(tuteurId);
        Map<String, Object> stats = new HashMap<>();

        long excellent = evaluations.stream().filter(e -> "excellent".equals(e.getStatut())).count();
        long bon = evaluations.stream().filter(e -> "bon".equals(e.getStatut())).count();
        long moyen = evaluations.stream().filter(e -> "moyen".equals(e.getStatut())).count();
        long insuffisant = evaluations.stream().filter(e -> "insuffisant".equals(e.getStatut())).count();

        stats.put("totalEvaluations", evaluations.size());
        stats.put("excellent", excellent);
        stats.put("bon", bon);
        stats.put("moyen", moyen);
        stats.put("insuffisant", insuffisant);

        return stats;
    }

    // Calculer la moyenne pondérée
    public double calculerMoyennePonderee(List<CritereEvaluation> criteres) {
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
    public String determinerStatut(double moyenne) {
        if (moyenne >= 9.0) return "excellent";
        if (moyenne >= 7.5) return "bon";
        if (moyenne >= 6.0) return "moyen";
        return "insuffisant";
    }

    // Obtenir les critères d'évaluation par défaut
    public List<CritereEvaluation> getCriteresParDefaut() {
        return List.of(
            new CritereEvaluation("competences_techniques", "Compétences Techniques", 
                "Maîtrise des technologies et outils utilisés", 5, 25, "code"),
            new CritereEvaluation("qualite_travail", "Qualité du Travail", 
                "Précision, rigueur et attention aux détails", 5, 25, "verified"),
            new CritereEvaluation("respect_delais", "Respect des Délais", 
                "Ponctualité et respect des échéances", 5, 20, "schedule"),
            new CritereEvaluation("communication", "Communication", 
                "Clarté dans les échanges et le reporting", 5, 15, "chat"),
            new CritereEvaluation("autonomie", "Autonomie", 
                "Capacité à travailler de manière indépendante", 5, 15, "person")
        );
    }
} 