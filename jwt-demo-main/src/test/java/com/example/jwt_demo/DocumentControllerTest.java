package com.example.jwt_demo;

import com.example.jwt_demo.controller.DocumentController;
import com.example.jwt_demo.model.DocumentEntity;
import com.example.jwt_demo.repository.DocumentRepository;
import com.example.jwt_demo.service.CloudinaryService;
import com.example.jwt_demo.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DocumentControllerTest {

    MockMvc mockMvc;
    DocumentService documentService;
    CloudinaryService cloudinaryService;
    DocumentRepository documentRepository;

    @BeforeEach
    void setup() {
        documentService = Mockito.mock(DocumentService.class);
        cloudinaryService = Mockito.mock(CloudinaryService.class);
        documentRepository = Mockito.mock(DocumentRepository.class);

        DocumentController controller = new DocumentController(documentService, cloudinaryService, documentRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getDocumentsByStagiaireReturnsList() throws Exception {
        DocumentEntity d = new DocumentEntity(); d.setId("d1"); d.setStagiaireId("s1");
        when(documentService.getDocumentsByStagiaire("s1")).thenReturn(List.of(d));

        mockMvc.perform(get("/api/documents/stagiaire/s1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("d1"));
    }

    @Test
    void uploadReturnsUrlAndPublicId() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", MediaType.TEXT_PLAIN_VALUE, "hello".getBytes());
        when(cloudinaryService.upload(any())).thenReturn(java.util.Map.of("secure_url", "https://cdn/test.txt", "public_id", "p1"));

        mockMvc.perform(multipart("/api/documents/upload").file(file).param("type","rapport").param("stagiaireId","s1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://cdn/test.txt"))
                .andExpect(jsonPath("$.public_id").value("p1"));
    }
}
