package com.example.jwt_demo.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class RapportRendu {
    private String description;
    private LocalDateTime dateRendu;
    private Boolean valide;
    private String commentaireEncadrant;
    private Integer note;
    private String fichierUrl;


    // Getters et Setters
}
