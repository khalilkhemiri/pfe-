package com.example.jwt_demo.controller;

import com.example.jwt_demo.model.User;
import com.example.jwt_demo.model.UserRole;
import com.example.jwt_demo.repository.UserRepository;
import com.example.jwt_demo.security.JwtUtil;
import com.example.jwt_demo.service.CloudinaryService;
import com.example.jwt_demo.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    CustomUserDetailsService emailService;
    @Autowired
    UserRepository userRepository;
    @Autowired
    PasswordEncoder encoder;
    @Autowired
    JwtUtil jwtUtils;
    @Autowired
    CloudinaryService cloudinaryService;
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody User user) {
        User existingUser = userRepository.findByUsername(user.getUsername());

        if (!existingUser.isActive()) {
            return ResponseEntity.ok("Votre compte n'a pas encore été validé par l'administrateur.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        user.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtils.generateToken(userDetails.getUsername(), existingUser.getRole());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(response); // 👈 JSON { token: "..." }
    }



    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> registerUser(
            @RequestPart("user") User user,
            @RequestPart("image") MultipartFile imageFile) {

        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        try {
            Map uploadResult = cloudinaryService.upload(imageFile);
            String imageUrl = (String) uploadResult.get("secure_url");
            user.setImage(imageUrl); // <- Assure-toi que ton entité User a un champ `image`

            user.setPassword(encoder.encode(user.getPassword()));
            user.setRole(null);
            emailService.sendAdminNotification(user.getEmail());

            userRepository.save(user);

            return ResponseEntity.ok("User registered successfully!");

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Image upload failed.");
        }
    }


    @PutMapping("/validate/{id}")
    public String validateUser(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setActive(true);
        userRepository.save(user);

        return "Utilisateur activé : ";
    }
    @DeleteMapping("/reject/{id}")
    public String rejectUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return "Utilisateur supprimé";
    }
    @GetMapping("/pending")
    public List<User> getPendingUsers() {
        return userRepository.findByActiveFalse();
    }
    @PostMapping("/assign-tuteur/{stagiaireId}/{tuteurId}")
    public ResponseEntity<String> assignTuteur(
            @PathVariable String stagiaireId,
            @PathVariable String tuteurId) {
        Optional<User> stagiaireOpt = userRepository.findById(stagiaireId);
        Optional<User> tuteurOpt = userRepository.findById(tuteurId);

        if (stagiaireOpt.isPresent() && tuteurOpt.isPresent()) {
            User stagiaire = stagiaireOpt.get();
            User tuteur = tuteurOpt.get();

            if (tuteur.getRole() != UserRole.TUTEUR) {
                return ResponseEntity.badRequest().body("L'utilisateur choisi n'est pas un tuteur.");
            }

            stagiaire.setTuteurId(tuteur.getId());
            userRepository.save(stagiaire);

            return ResponseEntity.ok("Tuteur assigné avec succès !");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Stagiaire ou tuteur introuvable.");
    }
    @GetMapping("/stagiaires-by-tuteur/{tuteurId}")
    public List<User> getStagiairesByTuteur(@PathVariable String tuteurId) {
        return userRepository.findByTuteurId(tuteurId);
    }

    @GetMapping("/stagiaire/{id}")
    public ResponseEntity<?> getStagiaireById(@PathVariable String id) {
        Optional<User> stagiaire = userRepository.findById(id);
        if (stagiaire.isPresent()) {
            return ResponseEntity.ok(stagiaire.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Stagiaire non trouvé");
    }

}
