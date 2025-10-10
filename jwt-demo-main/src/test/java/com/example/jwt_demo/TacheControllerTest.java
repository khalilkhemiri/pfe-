package com.example.jwt_demo;

import com.example.jwt_demo.controller.TacheController;
import com.example.jwt_demo.model.Tache;
import com.example.jwt_demo.model.User;
import com.example.jwt_demo.repository.TacheRepository;
import com.example.jwt_demo.repository.UserRepository;
import com.example.jwt_demo.service.CloudinaryService;
import com.example.jwt_demo.service.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TacheControllerTest {
    MockMvc mockMvc;
    UserRepository userRepository;
    TacheRepository tacheRepository;
    CloudinaryService cloudinaryService;
    CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        tacheRepository = Mockito.mock(TacheRepository.class);
        cloudinaryService = Mockito.mock(CloudinaryService.class);
        customUserDetailsService = Mockito.mock(CustomUserDetailsService.class);

        TacheController controller = new TacheController();
        // inject fields
        try {
            var f1 = TacheController.class.getDeclaredField("userRepository"); f1.setAccessible(true); f1.set(controller, userRepository);
            var f2 = TacheController.class.getDeclaredField("tacheRepository"); f2.setAccessible(true); f2.set(controller, tacheRepository);
            var f3 = TacheController.class.getDeclaredField("cloudinaryService"); f3.setAccessible(true); f3.set(controller, cloudinaryService);
            var f4 = TacheController.class.getDeclaredField("customUserDetailsService"); f4.setAccessible(true); f4.set(controller, customUserDetailsService);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void assignTacheSavesAndSendsMail() throws Exception {
        Tache t = new Tache(); t.setId("t1"); t.setTitre("T");
        when(tacheRepository.save(any())).thenReturn(t);
        when(userRepository.findById(any())).thenReturn(Optional.of(new User()));

        String json = "{\"id\":\"t1\",\"titre\":\"T\"}";
        mockMvc.perform(post("/api/taches/assign").contentType("application/json").content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("t1"));
    }
}
