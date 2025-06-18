package com.example.jwt_demo.controller;

import com.example.jwt_demo.model.StatutTache;
import com.example.jwt_demo.model.Tache;
import com.example.jwt_demo.repository.TacheRepository;
import com.example.jwt_demo.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/taches")
public class TacheController {

    @Autowired
    private TacheRepository tacheRepository;
   @Autowired
   CloudinaryService cloudinaryService;
    @PostMapping("/assign")
    public ResponseEntity<Tache> assignTache(@RequestBody Tache tache) {
        Tache saved = tacheRepository.save(tache);
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
    public ResponseEntity<?> envoyerRendu(@PathVariable Long id,
                                          @RequestParam("renduText") String renduText,
                                          @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        // Optionnel : sauvegarde du fichier via Cloudinary
        String fileUrl = null;
        if (file != null && !file.isEmpty()) {
            fileUrl = cloudinaryService.upload(file).get("secure_url").toString();
        }

        // Logique : enregistrer le rendu dans la base
       // tacheService.saveRendu(id, renduText, fileUrl);
        return ResponseEntity.ok().body(Map.of("message", "Rendu enregistré avec succès"));
    }

}
