package com.example.jwt_demo.controller;

import com.example.jwt_demo.model.DocumentEntity;
import com.example.jwt_demo.repository.DocumentRepository;
import com.example.jwt_demo.service.CloudinaryService;
import com.example.jwt_demo.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final CloudinaryService cloudinaryService;
    private final DocumentRepository documentRepository;
    public DocumentController(DocumentService documentService, CloudinaryService cloudinaryService, DocumentRepository documentRepository) {
        this.documentService = documentService;
        this.cloudinaryService = cloudinaryService;
        this.documentRepository = documentRepository;
    }

    // Upload d'un document
    @PostMapping("/upload")
    public Map uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            @RequestParam("stagiaireId") String stagiaireId) throws IOException {
        Map uploadResult = cloudinaryService.upload(file);
        String fileUrl = (String) uploadResult.get("secure_url");

        // Ici tu sauvegardes dans la DB : stagiaireId, type, fileUrl, etc.
        DocumentEntity document = new DocumentEntity();
        document.setStagiaireId(stagiaireId);
        document.setType(type);
        document.setUrl(fileUrl);
        documentRepository.save(document);

        return Map.of(
                "url", fileUrl,
                "public_id", uploadResult.get("public_id")
        );
    }


    // Liste des documents d'un stagiaire
    @GetMapping("/stagiaire/{stagiaireId}")
    public ResponseEntity<List<DocumentEntity>> getDocumentsByStagiaire(@PathVariable String stagiaireId) {
        List<DocumentEntity> docs = documentService.getDocumentsByStagiaire(stagiaireId);
        return ResponseEntity.ok(docs);
    }

    // Supprimer un document
    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable String documentId) throws IOException {
        documentService.deleteDocument(documentId);
        return ResponseEntity.ok().build();
    }
}