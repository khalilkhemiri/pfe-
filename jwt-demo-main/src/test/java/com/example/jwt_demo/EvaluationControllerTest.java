package com.example.jwt_demo;

import com.example.jwt_demo.controller.EvaluationController;
import com.example.jwt_demo.model.CritereEvaluation;
import com.example.jwt_demo.model.Evaluation;
import com.example.jwt_demo.service.EvaluationService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EvaluationController.class)
@AutoConfigureMockMvc(addFilters = false)
class EvaluationControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    EvaluationService evaluationService;

    @Test
    void createEvaluationReturnsOk() throws Exception {
        Evaluation e = new Evaluation(); e.setId("ev1");
        when(evaluationService.createEvaluation(Mockito.any())).thenReturn(e);

        String body = "{ }";
        mockMvc.perform(post("/api/evaluations/create").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("ev1"));
    }

    @Test
    void getCriteresReturnsList() throws Exception {
        when(evaluationService.getCriteresParDefaut()).thenReturn(List.of(new CritereEvaluation()));
        mockMvc.perform(get("/api/evaluations/criteres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getStagiaireStatsReturnsMap() throws Exception {
        when(evaluationService.getStagiaireStats("s1")).thenReturn(Map.of("moyenneGlobale", 5.0));
        mockMvc.perform(get("/api/evaluations/stats/stagiaire/s1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.moyenneGlobale").value(5.0));
    }
}
