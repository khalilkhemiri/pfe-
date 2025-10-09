package com.example.jwt_demo;

import com.example.jwt_demo.controller.DocumentController;
import com.example.jwt_demo.model.DocumentEntity;
import com.example.jwt_demo.repository.DocumentRepository;
import com.example.jwt_demo.service.CloudinaryService;
import com.example.jwt_demo.service.DocumentService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DocumentController.class)
@AutoConfigureMockMvc(addFilters = false)
class DocumentControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    DocumentService documentService;

    @MockBean
    CloudinaryService cloudinaryService;

    @MockBean
    DocumentRepository documentRepository;

    @Test
    void getDocumentsByStagiaireReturnsList() throws Exception {
        DocumentEntity d = new DocumentEntity(); d.setId("d1"); d.setStagiaireId("s1");
        when(documentService.getDocumentsByStagiaire("s1")).thenReturn(List.of(d));

        mockMvc.perform(get("/api/documents/stagiaire/s1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void deleteDocumentReturnsOk() throws Exception {
        Mockito.doNothing().when(documentService).deleteDocument("d1");
        mockMvc.perform(delete("/api/documents/d1"))
                .andExpect(status().isOk());
    }

    @Test
    void uploadDocumentReturnsUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "hello".getBytes());
        when(cloudinaryService.upload(any())).thenReturn(java.util.Map.of("secure_url", "https://cdn/test.txt", "public_id", "pub1"));

        mockMvc.perform(multipart("/api/documents/upload")
                        .file(file)
                        .param("type", "rapport")
                        .param("stagiaireId", "s1")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://cdn/test.txt"));
    }
}
