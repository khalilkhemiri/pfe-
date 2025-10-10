package com.example.jwt_demo;

import com.example.jwt_demo.controller.DocumentController;
import com.example.jwt_demo.model.DocumentEntity;
import com.example.jwt_demo.repository.DocumentRepository;
import com.example.jwt_demo.service.CloudinaryService;
import com.example.jwt_demo.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DocumentControllerTest {

    private MockMvc mockMvc;
    private DocumentService documentService;
    private CloudinaryService cloudinaryService;
    private DocumentRepository documentRepository;
    private DocumentController documentController;

    @BeforeEach
    void setUp() {
        documentService = Mockito.mock(DocumentService.class);
        cloudinaryService = Mockito.mock(CloudinaryService.class);
        documentRepository = Mockito.mock(DocumentRepository.class);

        documentController = new DocumentController(documentService, cloudinaryService, documentRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(documentController).build();
    }

    @Test
    void uploadDocumentSavesAndReturnsUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "hello".getBytes());
        
        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://cdn.example.com/test.txt");
        uploadResult.put("public_id", "test123");
        
        when(cloudinaryService.upload(any())).thenReturn(uploadResult);
        when(documentRepository.save(any(DocumentEntity.class))).thenReturn(new DocumentEntity());
        
        mockMvc.perform(multipart("/api/documents/upload")
                        .file(file)
                        .param("type", "rapport")
                        .param("stagiaireId", "stag1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://cdn.example.com/test.txt"))
                .andExpect(jsonPath("$.public_id").value("test123"));
    }

    @Test
    void getDocumentsByStagiaireReturnsDocuments() throws Exception {
        DocumentEntity doc1 = new DocumentEntity();
        doc1.setId("doc1");
        doc1.setStagiaireId("stag1");
        doc1.setType("rapport");
        
        DocumentEntity doc2 = new DocumentEntity();
        doc2.setId("doc2");
        doc2.setStagiaireId("stag1");
        doc2.setType("presentation");
        
        List<DocumentEntity> documents = Arrays.asList(doc1, doc2);
        
        when(documentService.getDocumentsByStagiaire("stag1")).thenReturn(documents);
        
        mockMvc.perform(get("/api/documents/stagiaire/stag1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value("doc1"))
                .andExpect(jsonPath("$[1].id").value("doc2"));
    }

    @Test
    void deleteDocumentReturnsOk() throws Exception {
        mockMvc.perform(delete("/api/documents/doc1"))
                .andExpect(status().isOk());
        
        Mockito.verify(documentService).deleteDocument("doc1");
    }

    @Test
    void uploadDocumentHandlesIOException() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "hello".getBytes());
        
        when(cloudinaryService.upload(any())).thenThrow(new IOException("Upload failed"));
        
        // The controller method declares "throws IOException", so the exception will be propagated
        // We expect an exception to be thrown when calling the endpoint
        assertThrows(Exception.class, () -> {
            mockMvc.perform(multipart("/api/documents/upload")
                            .file(file)
                            .param("type", "rapport")
                            .param("stagiaireId", "stag1"));
        });
    }

    @Test
    void deleteDocumentHandlesIOException() throws Exception {
        Mockito.doThrow(new IOException("Delete failed")).when(documentService).deleteDocument("doc1");
        
        // The controller method declares "throws IOException", so the exception will be propagated
        // We expect an exception to be thrown when calling the endpoint
        assertThrows(Exception.class, () -> {
            mockMvc.perform(delete("/api/documents/doc1"));
        });
    }
}