package com.example.jwt_demo;

import com.example.jwt_demo.controller.AuthController;
import com.example.jwt_demo.model.User;
import com.example.jwt_demo.model.UserRole;
import com.example.jwt_demo.repository.UserRepository;
import com.example.jwt_demo.security.JwtUtil;
import com.example.jwt_demo.service.CloudinaryService;
import com.example.jwt_demo.service.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private CustomUserDetailsService emailService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtUtil jwtUtils;

    @MockBean
    private CloudinaryService cloudinaryService;

    @MockBean
    private PasswordEncoder encoder;

    @Test
    void signinReturnsTokenWhenActive() throws Exception {
        User existing = new User();
        existing.setId("1");
        existing.setUsername("john");
        existing.setPassword("pwd");
        existing.setActive(true);

        Mockito.when(userRepository.findByUsername("john")).thenReturn(existing);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("john")
                .password("pwd")
                .authorities(Collections.emptyList())
                .build();

        Mockito.when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));

        Mockito.when(jwtUtils.generateToken("john", "1", existing.getRole())).thenReturn("token-abc");

        String body = "{ \"username\": \"john\", \"password\": \"pwd\" }";

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-abc"));
    }

    @Test
    void getPendingUsersReturnsList() throws Exception {
        User u1 = new User(); u1.setId("a"); u1.setUsername("u1"); u1.setActive(false);
        User u2 = new User(); u2.setId("b"); u2.setUsername("u2"); u2.setActive(false);
        Mockito.when(userRepository.findByActiveFalse()).thenReturn(Arrays.asList(u1, u2));

        mockMvc.perform(get("/api/auth/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void assignTuteurSuccessAndBadRole() throws Exception {
        User stagiaire = new User(); stagiaire.setId("s1"); stagiaire.setUsername("stag"); stagiaire.setRole(UserRole.STAGIAIRE);
        User tuteur = new User(); tuteur.setId("t1"); tuteur.setUsername("tut"); tuteur.setRole(UserRole.TUTEUR);

        Mockito.when(userRepository.findById("s1")).thenReturn(Optional.of(stagiaire));
        Mockito.when(userRepository.findById("t1")).thenReturn(Optional.of(tuteur));

        mockMvc.perform(post("/api/auth/assign-tuteur/s1/t1"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Tuteur assigné")));

        // tuteur with wrong role
        User wrong = new User(); wrong.setId("t2"); wrong.setRole(UserRole.STAGIAIRE);
        Mockito.when(userRepository.findById("t2")).thenReturn(Optional.of(wrong));

        mockMvc.perform(post("/api/auth/assign-tuteur/s1/t2"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("n'est pas un tuteur")));
    }

    @Test
    void getStagiaireByIdNotFound() throws Exception {
        Mockito.when(userRepository.findById("missing")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/auth/stagiaire/missing"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Stagiaire non trouvé")));
    }

    @Test
    void deleteUserSuccess() throws Exception {
        User u = new User(); u.setId("del1"); u.setUsername("toDelete");
        Mockito.when(userRepository.findById("del1")).thenReturn(Optional.of(u));

        mockMvc.perform(delete("/api/auth/delete/del1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("del1"))
                .andExpect(jsonPath("$.message").exists());
    }

}
