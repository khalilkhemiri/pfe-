package com.example.jwt_demo.service;


import com.example.jwt_demo.model.DocumentEntity;
import com.example.jwt_demo.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CloudinaryService cloudinaryService;

    public DocumentService(DocumentRepository documentRepository, CloudinaryService cloudinaryService) {
        this.documentRepository = documentRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public DocumentEntity uploadDocument(String stagiaireId, String type, MultipartFile file) throws IOException {
        // Upload vers Cloudinary
        Map uploadResult = cloudinaryService.upload(file);
        String url = uploadResult.get("secure_url").toString();

        // Sauvegarde en base
        DocumentEntity doc = new DocumentEntity();
        doc.setStagiaireId(stagiaireId);
        doc.setType(type);
        doc.setFileName(file.getOriginalFilename());
        doc.setUrl(url);
        doc.setStatus("uploaded");

        return documentRepository.save(doc);
    }

    public List<DocumentEntity> getDocumentsByStagiaire(String stagiaireId) {
        return documentRepository.findByStagiaireId(stagiaireId);
    }

    public void deleteDocument(String documentId) throws IOException {
        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Supprime de Cloudinary
        cloudinaryService.delete(doc.getId());

        // Supprime en base
        documentRepository.deleteById(documentId);
    }
}