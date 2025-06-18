import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage, User } from '../chat.service';
import { AuthService } from '../../../service/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stagiaire-chat',
  templateUrl: './stagiaire-chat.component.html',
  styleUrls: ['./stagiaire-chat.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class StagiaireChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  tuteur: User | null = null;
  newMessage: string = '';
  currentUser: User = {
    id: '684848c2723f2b2316deef13',  // ID statique du stagiaire
    name: 'Stagiaire'  // Nom statique du stagiaire
  };
  private messageSubscription: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    this.messageSubscription = this.chatService.messages$.subscribe(message => {
      console.log('New message received in component:', message);
      if (message.sender.id === this.tuteur?.id || message.receiver.id === this.tuteur?.id) {
        this.messages.push(message);
      }
    });
  }

  ngOnInit() {
    this.chatService.initializeUser(this.currentUser.id);
    this.loadTuteur();
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }

  loadTuteur() {
    // Pour le moment, on définit le tuteur statiquement
    this.tuteur = {
      id: '67fe612de3c8970cb882f1e3',
      name: 'Tuteur',
      avatar: 'assets/images/avatars/default.jpg'
    };
    this.loadConversation();
  }

  loadConversation() {
    if (this.tuteur) {
      this.chatService.getConversation(this.currentUser.id, this.tuteur.id)
        .subscribe({
          next: (messages) => {
            if (messages && Array.isArray(messages)) {
              this.messages = messages.map(msg => ({
                ...msg,
                sender: msg.sender || { id: '', name: '' },
                receiver: msg.receiver || { id: '', name: '' },
                timestamp: msg.timestamp || new Date()
              }));
            }
            this.markMessagesAsRead();
          },
          error: (error) => {
            console.error('Error loading conversation:', error);
            this.messages = [];
          }
        });
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.tuteur) return;

    const message: Partial<ChatMessage> = {
      sender: this.currentUser,
      receiver: this.tuteur,
      content: this.newMessage,
      timestamp: new Date(),
      read: false
    };

    this.chatService.sendMessage(message)
      .subscribe({
        next: (newMessage) => {
          if (newMessage) {
            this.messages.push(newMessage);
            this.newMessage = '';
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
        }
      });
  }

  markMessagesAsRead() {
    if (this.tuteur) {
      this.chatService.markMessagesAsRead(this.currentUser.id, this.tuteur.id)
        .subscribe({
          error: (error) => {
            console.error('Error marking messages as read:', error);
          }
        });
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
} 