package com.example.jwt_demo;

import com.example.jwt_demo.controller.EvaluationController;
import com.example.jwt_demo.model.Evaluation;
import com.example.jwt_demo.service.EvaluationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class EvaluationControllerTest {

    MockMvc mockMvc;
    EvaluationService evaluationService;

    @BeforeEach
    void setUp() {
        evaluationService = Mockito.mock(EvaluationService.class);
        EvaluationController controller = new EvaluationController();
        // inject service via reflection
        try {
            var f = EvaluationController.class.getDeclaredField("evaluationService");
            f.setAccessible(true);
            f.set(controller, evaluationService);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getEvaluationsByStagiaireReturnsList() throws Exception {
        when(evaluationService.getEvaluationsByStagiaire("s1")).thenReturn(List.of(new Evaluation()));

        mockMvc.perform(get("/api/evaluations/stagiaire/s1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").exists());
    }
}
