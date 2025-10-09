package com.example.jwt_demo;

import com.example.jwt_demo.model.DocumentEntity;
import com.example.jwt_demo.repository.DocumentRepository;
import com.example.jwt_demo.service.CloudinaryService;
import com.example.jwt_demo.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DocumentServiceTest {

    DocumentRepository docRepo;
    CloudinaryService cloudinaryService;
    DocumentService documentService;

    @BeforeEach
    void setup() {
        docRepo = Mockito.mock(DocumentRepository.class);
        cloudinaryService = Mockito.mock(CloudinaryService.class);
        documentService = new DocumentService(docRepo, cloudinaryService);
    }

    @Test
    void uploadDocumentSavesEntity() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "hello".getBytes());

        Map<String, Object> uploadMap = new HashMap<>();
        uploadMap.put("secure_url", "https://cdn/example/test.txt");
        uploadMap.put("public_id", "pub123");

        when(cloudinaryService.upload(any())).thenReturn(uploadMap);

        DocumentEntity saved = new DocumentEntity();
        saved.setId("d1");
        when(docRepo.save(any())).thenReturn(saved);

        DocumentEntity result = documentService.uploadDocument("s1", "rapport", file);

        assertNotNull(result);
        assertEquals("d1", result.getId());

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(docRepo).save(captor.capture());
        DocumentEntity captured = captor.getValue();
        assertEquals("s1", captured.getStagiaireId());
        assertEquals("rapport", captured.getType());
        assertEquals("test.txt", captured.getFileName());
        assertEquals("uploaded", captured.getStatus());
    }

    @Test
    void deleteDocumentInvokesCloudinaryAndRepo() throws IOException {
        DocumentEntity doc = new DocumentEntity();
        doc.setId("del1");
        when(docRepo.findById("del1")).thenReturn(Optional.of(doc));

        documentService.deleteDocument("del1");

        verify(cloudinaryService).delete("del1");
        verify(docRepo).deleteById("del1");
    }
}
