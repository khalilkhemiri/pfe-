package com.example.jwt_demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Date;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user")
public class User {
    @Id
    private String id;

    private String username;
    private String email;
    private String password;
    private String phone;
    private String image;
    @Field("role")
    private UserRole role;

    private boolean active = false;
    private Date createdAt = new Date();
    @Field("tuteurId")
    private String tuteurId;


    // Constructeur personnalisé
    public User(String username, String email, String phone, String encodedPassword) {
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.password = encodedPassword;
    }
}
