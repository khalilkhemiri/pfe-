package com.example.jwt_demo.service;

import com.example.jwt_demo.model.Meeting;
import com.example.jwt_demo.repository.MeetingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MeetingService {
    private final MeetingRepository meetingRepository;
    private final CustomUserDetailsService emailService;

    public MeetingService(MeetingRepository meetingRepository, CustomUserDetailsService emailService) {
        this.meetingRepository = meetingRepository;
        this.emailService = emailService;
    }

    public Meeting createMeeting(Meeting meeting, String stagiaireEmail) {
        Meeting saved = meetingRepository.save(meeting);

        emailService.sendMeetingInvitation(
                stagiaireEmail,
                meeting.getTitle(),
                meeting.getDate().toString(), // ou formaté avec DateTimeFormatter
                meeting.getMeetingLink()
        );

        return saved;
    }
    public List<Meeting> getMeetingsByStagiaire(String stagiaireId) {
        return meetingRepository.findByStagiaireId(stagiaireId);
    }

}
