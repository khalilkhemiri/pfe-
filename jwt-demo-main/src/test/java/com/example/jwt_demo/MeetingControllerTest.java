package com.example.jwt_demo;

import com.example.jwt_demo.controller.MeetingController;
import com.example.jwt_demo.model.Meeting;
import com.example.jwt_demo.model.User;
import com.example.jwt_demo.repository.UserRepository;
import com.example.jwt_demo.service.MeetingService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MeetingController.class)
@AutoConfigureMockMvc(addFilters = false)
class MeetingControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    MeetingService meetingService;

    @MockBean
    UserRepository userRepository;

    @Test
    void createMeetingSuccess() throws Exception {
        Meeting m = new Meeting(); m.setId("meet1"); m.setTitle("Meet"); m.setStagiaireId("s1"); m.setDate(LocalDateTime.now());
        when(userRepository.findById("s1")).thenReturn(Optional.of(new User()));
        when(meetingService.createMeeting(any(), any())).thenReturn(m);

        String body = "{\"stagiaireId\": \"s1\", \"title\": \"Meet\"}";

        mockMvc.perform(post("/api/meetings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("meet1"));
    }

    @Test
    void createMeetingStagiaireNotFound() throws Exception {
        when(userRepository.findById("s2")).thenReturn(Optional.empty());
        String body = "{\"stagiaireId\": \"s2\", \"title\": \"Meet\"}";
        mockMvc.perform(post("/api/meetings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isInternalServerError());
    }
}
