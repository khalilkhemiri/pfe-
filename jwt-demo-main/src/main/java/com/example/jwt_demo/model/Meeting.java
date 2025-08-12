package com.example.jwt_demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meetings")
public class Meeting {
    @Id
    private String id;
    private String title;
    private LocalDateTime date;
    private String description;
    private String stagiaireId;
    private String tuteurId;
    @JsonProperty("link")
    private String meetingLink;

}
