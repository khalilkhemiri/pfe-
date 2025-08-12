package com.example.jwt_demo.controller;

import com.example.jwt_demo.model.RapportRendu;
import com.example.jwt_demo.model.StatutTache;
import com.example.jwt_demo.model.Tache;
import com.example.jwt_demo.model.User;
import com.example.jwt_demo.repository.TacheRepository;
import com.example.jwt_demo.repository.UserRepository;
import com.example.jwt_demo.service.CloudinaryService;
import com.example.jwt_demo.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/taches")
public class TacheController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TacheRepository tacheRepository;
    @Autowired
    CloudinaryService cloudinaryService;
    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @PostMapping("/assign")
    public ResponseEntity<Tache> assignTache(@RequestBody Tache tache) {
        Tache saved = tacheRepository.save(tache);
        // Envoi d'un mail à chaque stagiaire assigné
        if (saved.getStagiairesIds() != null) {
            for (String stagiaireId : saved.getStagiairesIds()) {
                Optional<User> userOpt = userRepository.findById(stagiaireId);
                if (userOpt.isPresent()) {
                    String stagiaireEmail = userOpt.get().getEmail();
                    if (stagiaireEmail != null && !stagiaireEmail.isEmpty()) {
                        customUserDetailsService.sendTacheAssignedNotification(stagiaireEmail, saved.getTitre());
                    }
                }
            }
        }
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/stagiaire/{id}")
    public ResponseEntity<List<Tache>> getTachesByStagiaire(@PathVariable String id) {
        return ResponseEntity.ok(tacheRepository.findByStagiairesIds(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tache> updateTache(@PathVariable String id, @RequestBody Tache tache) {
        Optional<Tache> optional = tacheRepository.findById(id);
        if (optional.isPresent()) {
            Tache existing = optional.get();
            existing.setTitre(tache.getTitre());
            existing.setDescription(tache.getDescription());
            existing.setDateDebut(tache.getDateDebut());
            existing.setDateFin(tache.getDateFin());
            existing.setStatut(tache.getStatut());
            return ResponseEntity.ok(tacheRepository.save(existing));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/rendu")
    public ResponseEntity<?> envoyerRendu(@PathVariable String id,
                                          @RequestParam("commentaire") String commentaire,
                                          @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        Optional<Tache> optionalTache = tacheRepository.findById(id);

        if (optionalTache.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Tâche non trouvée"));
        }

        Tache tache = optionalTache.get();

        // Upload fichier s'il existe
        String fileUrl = null;
        if (file != null && !file.isEmpty()) {
            fileUrl = cloudinaryService.upload(file).get("secure_url").toString();
        }

        // Créer l'objet RapportRendu
        RapportRendu rapport = new RapportRendu();
        rapport.setDescription(commentaire);
        rapport.setDateRendu(LocalDateTime.now());
        rapport.setFichierUrl(fileUrl);
        rapport.setValide(null);  // À valider plus tard par l'encadrant
        rapport.setCommentaireEncadrant(null);
        rapport.setNote(null);

        // Associer le rendu à la tâche
        tache.setRapportRendu(rapport);
        tache.setStatut(StatutTache.TERMINEE); // Facultatif

        // Sauvegarder
        tacheRepository.save(tache);

        return ResponseEntity.ok().body(Map.of("message", "Rendu enregistré avec succès"));
    }

    @PutMapping("/{tacheId}/rendu/valider")
    public ResponseEntity<?> validerRendu(@PathVariable String tacheId, @RequestParam(required = false) String commentaire, @RequestParam(required = false) Integer note) {
        Optional<Tache> optionalTache = tacheRepository.findById(tacheId);
        if (optionalTache.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Tâche non trouvée"));
        }
        Tache tache = optionalTache.get();
        if (tache.getRapportRendu() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Aucun rendu à valider"));
        }
        tache.getRapportRendu().setValide(true);
        tache.getRapportRendu().setCommentaireEncadrant(commentaire);
        tache.getRapportRendu().setNote(note);
        tacheRepository.save(tache);
        return ResponseEntity.ok(Map.of("message", "Rendu validé"));
    }

    @PutMapping("/{tacheId}/rendu/rejeter")
    public ResponseEntity<?> rejeterRendu(@PathVariable String tacheId, @RequestParam(required = false) String commentaire) {
        Optional<Tache> optionalTache = tacheRepository.findById(tacheId);
        if (optionalTache.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Tâche non trouvée"));
        }
        Tache tache = optionalTache.get();
        if (tache.getRapportRendu() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Aucun rendu à rejeter"));
        }
        tache.getRapportRendu().setValide(false);
        tache.getRapportRendu().setCommentaireEncadrant(commentaire);
        tacheRepository.save(tache);
        return ResponseEntity.ok(Map.of("message", "Rendu rejeté"));
    }

}
