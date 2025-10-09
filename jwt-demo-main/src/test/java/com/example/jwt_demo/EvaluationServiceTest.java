package com.example.jwt_demo;

import com.example.jwt_demo.model.CritereEvaluation;
import com.example.jwt_demo.service.EvaluationService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class EvaluationServiceTest {

    EvaluationService service = new EvaluationService();

    @Test
    void calculerMoyennePondereeEmptyReturnsZero() {
        assertEquals(0.0, service.calculerMoyennePonderee(List.of()));
    }

    @Test
    void calculerMoyennePondereeWorks() {
        CritereEvaluation c1 = new CritereEvaluation("a","A","", 4, 2, "");
        CritereEvaluation c2 = new CritereEvaluation("b","B","", 6, 3, "");
        double res = service.calculerMoyennePonderee(List.of(c1, c2));
        // (4*2 + 6*3) / (2+3) = (8+18)/5 = 26/5 = 5.2 -> rounded to 5.2
        assertEquals(5.2, res);
    }

    @Test
    void determinerStatutThresholds() {
        assertEquals("excellent", service.determinerStatut(9.0));
        assertEquals("bon", service.determinerStatut(8.0));
        assertEquals("moyen", service.determinerStatut(6.5));
        assertEquals("insuffisant", service.determinerStatut(5.0));
    }

    @Test
    void getCriteresParDefautNotEmpty() {
        assertFalse(service.getCriteresParDefaut().isEmpty());
    }
}
