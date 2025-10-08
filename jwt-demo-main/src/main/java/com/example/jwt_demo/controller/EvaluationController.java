package com.example.jwt_demo.controller;

import com.example.jwt_demo.model.Evaluation;
import com.example.jwt_demo.model.CritereEvaluation;
import com.example.jwt_demo.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    // Créer une nouvelle évaluation
    @PostMapping("/create")
    public ResponseEntity<?> createEvaluation(@RequestBody Evaluation evaluation) {
        try {
            Evaluation savedEvaluation = evaluationService.createEvaluation(evaluation);
            return ResponseEntity.ok(savedEvaluation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la création de l'évaluation: " + e.getMessage());
        }
    }

    // Obtenir toutes les évaluations d'un stagiaire
    @GetMapping("/stagiaire/{stagiaireId}")
    public ResponseEntity<List<Evaluation>> getEvaluationsByStagiaire(@PathVariable String stagiaireId) {
        List<Evaluation> evaluations = evaluationService.getEvaluationsByStagiaire(stagiaireId);
        return ResponseEntity.ok(evaluations);
    }

    // Obtenir toutes les évaluations d'un tuteur
    @GetMapping("/tuteur/{tuteurId}")
    public ResponseEntity<List<Evaluation>> getEvaluationsByTuteur(@PathVariable String tuteurId) {
        List<Evaluation> evaluations = evaluationService.getEvaluationsByTuteur(tuteurId);
        return ResponseEntity.ok(evaluations);
    }

    // Obtenir une évaluation spécifique
    @GetMapping("/{evaluationId}")
    public ResponseEntity<?> getEvaluationById(@PathVariable String evaluationId) {
        Optional<Evaluation> evaluation = evaluationService.getEvaluationById(evaluationId);
        if (evaluation.isPresent()) {
            return ResponseEntity.ok(evaluation.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Mettre à jour une évaluation
    @PutMapping("/{evaluationId}")
    public ResponseEntity<?> updateEvaluation(@PathVariable String evaluationId, @RequestBody Evaluation evaluation) {
        Evaluation updatedEvaluation = evaluationService.updateEvaluation(evaluationId, evaluation);
        if (updatedEvaluation != null) {
            return ResponseEntity.ok(updatedEvaluation);
        }
        return ResponseEntity.notFound().build();
    }

    // Supprimer une évaluation
    @DeleteMapping("/{evaluationId}")
    public ResponseEntity<?> deleteEvaluation(@PathVariable String evaluationId) {
        boolean deleted = evaluationService.deleteEvaluation(evaluationId);
        if (deleted) {
            return ResponseEntity.ok("Évaluation supprimée avec succès");
        }
        return ResponseEntity.notFound().build();
    }

    // Obtenir les statistiques d'un stagiaire
    @GetMapping("/stats/stagiaire/{stagiaireId}")
    public ResponseEntity<Map<String, Object>> getStagiaireStats(@PathVariable String stagiaireId) {
        Map<String, Object> stats = evaluationService.getStagiaireStats(stagiaireId);
        return ResponseEntity.ok(stats);
    }

    // Obtenir les statistiques d'un tuteur
    @GetMapping("/stats/tuteur/{tuteurId}")
    public ResponseEntity<Map<String, Object>> getTuteurStats(@PathVariable String tuteurId) {
        Map<String, Object> stats = evaluationService.getTuteurStats(tuteurId);
        return ResponseEntity.ok(stats);
    }

    // Obtenir les critères d'évaluation disponibles
    @GetMapping("/criteres")
    public ResponseEntity<List<CritereEvaluation>> getCriteresEvaluation() {
        List<CritereEvaluation> criteres = evaluationService.getCriteresParDefaut();
        return ResponseEntity.ok(criteres);
    }

    // Endpoint pour créer une évaluation avec critères par défaut
    @PostMapping("/create-with-default-criteres")
    public ResponseEntity<?> createEvaluationWithDefaultCriteres(@RequestBody Map<String, Object> request) {
        try {
            String stagiaireId = (String) request.get("stagiaireId");
            String tuteurId = (String) request.get("tuteurId");
            String commentaire = (String) request.get("commentaire");
            String recommandations = (String) request.get("recommandations");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> criteresData = (List<Map<String, Object>>) request.get("criteres");
            
            List<CritereEvaluation> criteres = criteresData.stream()
                .map(critereData -> new CritereEvaluation(
                    (String) critereData.get("critereId"),
                    ((Number) critereData.get("note")).intValue(),
                    ((Number) critereData.get("poids")).intValue()
                ))
                .toList();

            Evaluation evaluation = new Evaluation(stagiaireId, tuteurId, criteres, commentaire, recommandations);
            Evaluation savedEvaluation = evaluationService.createEvaluation(evaluation);
            
            return ResponseEntity.ok(savedEvaluation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la création de l'évaluation: " + e.getMessage());
        }
    }

    // Endpoint pour obtenir les évaluations récentes
    @GetMapping("/recentes/{tuteurId}")
    public ResponseEntity<List<Evaluation>> getEvaluationsRecentes(@PathVariable String tuteurId, 
                                                                  @RequestParam(defaultValue = "5") int limit) {
        List<Evaluation> evaluations = evaluationService.getEvaluationsByTuteur(tuteurId);
        if (evaluations.size() > limit) {
            evaluations = evaluations.subList(0, limit);
        }
        return ResponseEntity.ok(evaluations);
    }

    // Endpoint pour obtenir les évaluations par statut
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Evaluation>> getEvaluationsByStatut(@PathVariable String statut) {
        // Cette méthode nécessiterait d'être ajoutée au service
        return ResponseEntity.ok(List.of());
    }
} 