package com.example.jwt_demo;

import com.example.jwt_demo.controller.MeetingController;
import com.example.jwt_demo.model.Meeting;
import com.example.jwt_demo.model.User;
import com.example.jwt_demo.repository.UserRepository;
import com.example.jwt_demo.service.MeetingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MeetingControllerTest {
    MockMvc mockMvc;
    MeetingService meetingService;
    UserRepository userRepository;

    @BeforeEach
    void setUp() {
        meetingService = Mockito.mock(MeetingService.class);
        userRepository = Mockito.mock(UserRepository.class);

        MeetingController controller = new MeetingController(meetingService, userRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void createMeetingReturnsSaved() throws Exception {
        Meeting m = new Meeting();
        m.setId("m1");
        m.setTitle("Meet");
        m.setStagiaireId("s1");
        m.setDate(LocalDateTime.now());

        when(userRepository.findById("s1")).thenReturn(Optional.of(new User("u","u@example.com","","")));
        when(meetingService.createMeeting(any(), any())).thenReturn(m);

        String json = "{\"id\":\"m1\",\"title\":\"Meet\",\"stagiaireId\":\"s1\"}";

        mockMvc.perform(post("/api/meetings").contentType("application/json").content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("m1"));
    }
}
