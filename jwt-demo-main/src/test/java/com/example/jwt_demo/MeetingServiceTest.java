package com.example.jwt_demo;

import com.example.jwt_demo.model.Meeting;
import com.example.jwt_demo.repository.MeetingRepository;
import com.example.jwt_demo.service.CustomUserDetailsService;
import com.example.jwt_demo.service.MeetingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MeetingServiceTest {
    MeetingRepository meetingRepository;
    CustomUserDetailsService emailService;
    MeetingService meetingService;

    @BeforeEach
    void setUp() {
        meetingRepository = Mockito.mock(MeetingRepository.class);
        emailService = Mockito.mock(CustomUserDetailsService.class);
        meetingService = new MeetingService(meetingRepository, emailService);
    }

    @Test
    void createMeetingSavesAndSendsEmail() {
        Meeting m = new Meeting();
        m.setId("m1");
        m.setTitle("Sprint Demo");
        m.setDate(LocalDateTime.now());
        m.setMeetingLink("https://meet.example/test");

        when(meetingRepository.save(m)).thenReturn(m);

        Meeting result = meetingService.createMeeting(m, "s@example.com");
        assertNotNull(result);
        verify(meetingRepository).save(m);
        verify(emailService).sendMeetingInvitation(eq("s@example.com"), anyString(), anyString(), anyString());
    }
}
