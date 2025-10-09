package com.example.jwt_demo;

import com.example.jwt_demo.model.CritereEvaluation;
import com.example.jwt_demo.model.Evaluation;
import com.example.jwt_demo.repository.EvaluationRepository;
import com.example.jwt_demo.service.EvaluationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EvaluationServiceTest {
    EvaluationRepository evaluationRepository;
    EvaluationService evaluationService;

    @BeforeEach
    void setUp() {
        evaluationRepository = Mockito.mock(EvaluationRepository.class);
        evaluationService = new EvaluationService();
        // inject repo
        try {
            var f = EvaluationService.class.getDeclaredField("evaluationRepository");
            f.setAccessible(true);
            f.set(evaluationService, evaluationRepository);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void calculerMoyennePondereeAndDeterminerStatut() {
        var c1 = new CritereEvaluation("c1", "Comp", "", 8, 50, "");
        var c2 = new CritereEvaluation("c2", "Qual", "", 6, 50, "");
        double moyenne = evaluationService.calculerMoyennePonderee(List.of(c1, c2));
    assertEquals(7.0, moyenne);
    assertEquals("moyen", evaluationService.determinerStatut(moyenne));
    }

    @Test
    void getStagiaireStatsEmpty() {
        when(evaluationRepository.findByStagiaireIdOrderByDateEvaluationDesc("s1")).thenReturn(List.of());
        var stats = evaluationService.getStagiaireStats("s1");
        assertEquals(0.0, stats.get("moyenneGlobale"));
        assertEquals(0, stats.get("nombreEvaluations"));
    }

    @Test
    void createAndUpdateEvaluation() {
        Evaluation ev = new Evaluation();
        ev.setId("e1");
        when(evaluationRepository.save(any())).thenReturn(ev);

        Evaluation created = evaluationService.createEvaluation(ev);
        assertNotNull(created);

        // update non-existing should return null
        when(evaluationRepository.findById("missing")).thenReturn(Optional.empty());
        assertNull(evaluationService.updateEvaluation("missing", ev));
    }
}
