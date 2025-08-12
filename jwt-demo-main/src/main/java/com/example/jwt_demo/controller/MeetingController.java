package com.example.jwt_demo.controller;

import com.example.jwt_demo.model.Meeting;
import com.example.jwt_demo.model.User;
import com.example.jwt_demo.repository.UserRepository;
import com.example.jwt_demo.service.MeetingService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;
    private final UserRepository userRepository; // To fetch stagiaire email

    public MeetingController(MeetingService meetingService, UserRepository userRepository) {
        this.meetingService = meetingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Meeting createMeeting(@RequestBody Meeting meeting) {
        String stagiaireEmail = userRepository.findById(meeting.getStagiaireId())
                .map(User::getEmail)
                .orElseThrow(() -> new RuntimeException("Stagiaire not found"));
        return meetingService.createMeeting(meeting, stagiaireEmail);
    }
}
