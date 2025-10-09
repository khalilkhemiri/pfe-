package com.example.jwt_demo;

import com.example.jwt_demo.model.Meeting;
import com.example.jwt_demo.repository.MeetingRepository;
import com.example.jwt_demo.service.MeetingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class MeetingServiceGetTest {
    MeetingRepository meetingRepository;
    MeetingService meetingService;

    @BeforeEach
    void setUp() {
        meetingRepository = Mockito.mock(MeetingRepository.class);
        meetingService = new MeetingService(meetingRepository, null);
    }

    @Test
    void getMeetingsByStagiaireReturnsList() {
        when(meetingRepository.findByStagiaireId("s1")).thenReturn(List.of(new Meeting()));
        var res = meetingService.getMeetingsByStagiaire("s1");
        assertEquals(1, res.size());
    }
}
