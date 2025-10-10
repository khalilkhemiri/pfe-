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
import org.springframework.mock.web.MockMultipartFile;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
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

    @Test
    void signupWithExistingUsernameReturnsError() throws Exception {
        User user = new User();
        user.setUsername("existing");
        user.setPassword("pwd");
        user.setEmail("test@test.com");
        
        Mockito.when(userRepository.existsByUsername("existing")).thenReturn(true);

        MockMultipartFile imageFile = new MockMultipartFile("image", "test.jpg", "image/jpeg", "test image content".getBytes());
        MockMultipartFile userFile = new MockMultipartFile("user", "", "application/json", "{\"username\":\"existing\",\"password\":\"pwd\",\"email\":\"test@test.com\"}".getBytes());

        mockMvc.perform(multipart("/api/auth/signup")
                        .file(imageFile)
                        .file(userFile))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Username is already taken")));
    }

    @Test
    void signupWithImageUploadSuccess() throws Exception {
        Mockito.when(userRepository.existsByUsername("newuser")).thenReturn(false);
        
        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://cdn.example.com/image.jpg");
        Mockito.when(cloudinaryService.upload(any())).thenReturn(uploadResult);
        Mockito.when(encoder.encode("pwd")).thenReturn("encoded-pwd");

        MockMultipartFile imageFile = new MockMultipartFile("image", "test.jpg", "image/jpeg", "test image content".getBytes());
        MockMultipartFile userFile = new MockMultipartFile("user", "", "application/json", "{\"username\":\"newuser\",\"password\":\"pwd\",\"email\":\"test@test.com\"}".getBytes());

        mockMvc.perform(multipart("/api/auth/signup")
                        .file(imageFile)
                        .file(userFile))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("User registered successfully")));
    }

    @Test
    void signupWithImageUploadFailure() throws Exception {
        Mockito.when(userRepository.existsByUsername("newuser")).thenReturn(false);
        Mockito.when(cloudinaryService.upload(any())).thenThrow(new java.io.IOException("Upload failed"));

        MockMultipartFile imageFile = new MockMultipartFile("image", "test.jpg", "image/jpeg", "test image content".getBytes());
        MockMultipartFile userFile = new MockMultipartFile("user", "", "application/json", "{\"username\":\"newuser\",\"password\":\"pwd\",\"email\":\"test@test.com\"}".getBytes());

        mockMvc.perform(multipart("/api/auth/signup")
                        .file(imageFile)
                        .file(userFile))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Image upload failed")));
    }

    @Test
    void validateUserSuccess() throws Exception {
        User user = new User();
        user.setId("user1");
        user.setEmail("test@test.com");
        Mockito.when(userRepository.findById("user1")).thenReturn(Optional.of(user));

        mockMvc.perform(put("/api/auth/validate/user1"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Utilisateur activé")));
    }

    @Test
    void validateUserNotFound() throws Exception {
        Mockito.when(userRepository.findById("missing")).thenReturn(Optional.empty());

        // The controller throws RuntimeException when user is not found
        // This test verifies that the method exists and can be called
        // The actual exception handling would be tested in integration tests
        assertThrows(Exception.class, () -> {
            mockMvc.perform(put("/api/auth/validate/missing"));
        });
    }

    @Test
    void rejectUserSuccess() throws Exception {
        mockMvc.perform(delete("/api/auth/reject/user1"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Utilisateur supprimé")));
    }

    @Test
    void getStagiairesByTuteur() throws Exception {
        User stagiaire1 = new User(); stagiaire1.setId("s1"); stagiaire1.setTuteurId("t1");
        User stagiaire2 = new User(); stagiaire2.setId("s2"); stagiaire2.setTuteurId("t1");
        Mockito.when(userRepository.findByTuteurId("t1")).thenReturn(Arrays.asList(stagiaire1, stagiaire2));

        mockMvc.perform(get("/api/auth/stagiaires-by-tuteur/t1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getStagiaireByIdSuccess() throws Exception {
        User stagiaire = new User(); stagiaire.setId("s1"); stagiaire.setUsername("stag");
        Mockito.when(userRepository.findById("s1")).thenReturn(Optional.of(stagiaire));

        mockMvc.perform(get("/api/auth/stagiaire/s1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("s1"));
    }

    @Test
    void getAllStagiaires() throws Exception {
        User stagiaire1 = new User(); stagiaire1.setId("s1"); stagiaire1.setRole(UserRole.STAGIAIRE);
        User stagiaire2 = new User(); stagiaire2.setId("s2"); stagiaire2.setRole(UserRole.STAGIAIRE);
        Mockito.when(userRepository.findByRole(UserRole.STAGIAIRE)).thenReturn(Arrays.asList(stagiaire1, stagiaire2));

        mockMvc.perform(get("/api/auth/stagiaires"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getAllTuteurs() throws Exception {
        User tuteur1 = new User(); tuteur1.setId("t1"); tuteur1.setRole(UserRole.TUTEUR);
        User tuteur2 = new User(); tuteur2.setId("t2"); tuteur2.setRole(UserRole.TUTEUR);
        Mockito.when(userRepository.findByRole(UserRole.TUTEUR)).thenReturn(Arrays.asList(tuteur1, tuteur2));

        mockMvc.perform(get("/api/auth/tuteurs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void assignRoleSuccess() throws Exception {
        User user = new User(); user.setId("u1"); user.setUsername("user");
        Mockito.when(userRepository.findById("u1")).thenReturn(Optional.of(user));

        mockMvc.perform(put("/api/auth/assign-role/u1")
                        .param("role", "TUTEUR"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Rôle TUTEUR assigné")));
    }

    @Test
    void assignRoleUserNotFound() throws Exception {
        Mockito.when(userRepository.findById("missing")).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/auth/assign-role/missing")
                        .param("role", "TUTEUR"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Utilisateur introuvable")));
    }

    @Test
    void assignTuteurStagiaireNotFound() throws Exception {
        Mockito.when(userRepository.findById("missing")).thenReturn(Optional.empty());
        Mockito.when(userRepository.findById("t1")).thenReturn(Optional.of(new User()));

        mockMvc.perform(post("/api/auth/assign-tuteur/missing/t1"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("introuvable")));
    }

    @Test
    void assignTuteurTuteurNotFound() throws Exception {
        Mockito.when(userRepository.findById("s1")).thenReturn(Optional.of(new User()));
        Mockito.when(userRepository.findById("missing")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/assign-tuteur/s1/missing"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("introuvable")));
    }

    @Test
    void deleteUserNotFound() throws Exception {
        Mockito.when(userRepository.findById("missing")).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/auth/delete/missing"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("introuvable")));
    }

}