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

    public void sendTacheAssignedNotification(String stagiaireEmail, String tacheTitre) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("khalilkhemiri681@gmail.com");
        message.setTo(stagiaireEmail);
        message.setSubject("Nouvelle tâche à réaliser !");
        message.setText(
                "Bonjour,\n\n" +
                        "Vous venez de recevoir une nouvelle tâche à réaliser sur la plateforme QNB.\n\n" +
                        "Titre de la tâche : " + tacheTitre + "\n\n" +
                        "Merci de vous connecter à votre espace personnel pour consulter les détails et commencer votre travail.\n\n" +
                        "Bonne chance et n'hésitez pas à contacter votre tuteur en cas de besoin !\n\n" +
                        "Cordialement,\nL'équipe QNB"
        );
        mailSender.send(message);
    }
    public void sendMeetingInvitation(String stagiaireEmail, String meetingTitle, String meetingDate, String meetingLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("khalilkhemiri681@gmail.com");
        message.setTo(stagiaireEmail); // envoyer directement au stagiaire
        message.setSubject("Invitation à la réunion : " + meetingTitle);
        message.setText(
                "Bonjour,\n\n" +
                        "Vous êtes invité à une réunion.\n\n" +
                        "📌 Sujet : " + meetingTitle + "\n" +
                        "📅 Date et heure : " + meetingDate + "\n" +
                        "🔗 Lien de connexion : " + meetingLink + "\n\n" +
                        "Merci."
        );

        mailSender.send(message);
    }
}
