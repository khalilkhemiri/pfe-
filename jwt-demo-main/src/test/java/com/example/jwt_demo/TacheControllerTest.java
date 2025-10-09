package com.example.jwt_demo;

import com.example.jwt_demo.controller.TacheController;
import com.example.jwt_demo.model.RapportRendu;
import com.example.jwt_demo.model.StatutTache;
import com.example.jwt_demo.model.Tache;
import com.example.jwt_demo.model.User;
import com.example.jwt_demo.repository.TacheRepository;
import com.example.jwt_demo.repository.UserRepository;
import com.example.jwt_demo.service.CloudinaryService;
import com.example.jwt_demo.service.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TacheController.class)
@AutoConfigureMockMvc(addFilters = false)
class TacheControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    UserRepository userRepository;

    @MockBean
    TacheRepository tacheRepository;

    @MockBean
    CloudinaryService cloudinaryService;

    @MockBean
    CustomUserDetailsService customUserDetailsService;

    @Test
    void assignTacheSavesAndSendsMail() throws Exception {
        Tache t = new Tache();
        t.setId("t1");
        t.setTitre("T1");
        when(tacheRepository.save(any())).thenReturn(t);

        String body = "{ \"titre\": \"T1\" }";

        mockMvc.perform(post("/api/taches/assign").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("t1"));
    }

    @Test
    void envoyerRenduNotFoundReturns404() throws Exception {
        when(tacheRepository.findById("nope")).thenReturn(Optional.empty());
        mockMvc.perform(post("/api/taches/nope/rendu").param("commentaire", "c"))
                .andExpect(status().isNotFound());
    }

    @Test
    void validerAndRejeterRenduHappyPath() throws Exception {
        Tache t = new Tache();
        t.setId("t2");
        RapportRendu r = new RapportRendu(); r.setValide(null);
        t.setRapportRendu(r);
        when(tacheRepository.findById("t2")).thenReturn(Optional.of(t));
        when(tacheRepository.save(any())).thenReturn(t);

        mockMvc.perform(put("/api/taches/t2/rendu/valider").param("commentaire", "ok").param("note", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Rendu validé"));

        mockMvc.perform(put("/api/taches/t2/rendu/rejeter").param("commentaire", "nope"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Rendu rejeté"));
    }
}
