package com.example.jwt_demo.service;

import com.example.jwt_demo.model.User;
import com.example.jwt_demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.Collections;
@Service
public class CustomUserDetailsService  implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JavaMailSender mailSender;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User Not Found with username: " + username);
        }
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.emptyList()
        );
    }


    public void sendAdminNotification(String newUserEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("khalilkhemiri681@gmail.com"); // 📩 adresse de l’admin
        message.setSubject("Nouvelle inscription");
        message.setText("Un nouvel utilisateur a tenté de s'inscrire avec l'email : " + newUserEmail);

        mailSender.send(message);
    }
}
