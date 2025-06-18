import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage, User } from './chat.service';
import { AuthService } from '../../service/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  users: User[] = [];
  selectedUser: User | null = null;
  newMessage: string = '';
  currentUser: User = {
    id: '67fe612de3c8970cb882f1e3',
    name: 'Tuteur'
  };
  private messageSubscription: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    this.chatService.initializeUser(this.currentUser.id);
    
    this.messageSubscription = this.chatService.messages$.subscribe(message => {
      console.log('New message received in component:', message);
      if (this.selectedUser && 
          (message.sender.id === this.selectedUser.id || 
           message.receiver.id === this.selectedUser.id)) {
        console.log('Adding message to conversation');
        this.messages.push(message);
      } else {
        console.log('Message not for current conversation, ignoring');
      }
    });
  }

  ngOnInit() {
    this.loadStagiaires();
    this.loadUnreadMessages();
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }

  loadStagiaires() {
    const tuteurId = this.currentUser.id;
    console.log('Loading stagiaires for tuteur:', tuteurId);
    
    this.authService.getStagiairesByTuteur(tuteurId).subscribe({
      next: (stagiaires) => {
        console.log('Received stagiaires:', stagiaires);
        this.users = stagiaires.map(stagiaire => ({
          id: stagiaire.id,
          name: stagiaire.username,
          avatar: stagiaire.image || 'assets/images/avatars/default.jpg'
        }));
        console.log('Mapped users:', this.users);
      },
      error: (error) => {
        console.error('Error loading stagiaires:', error);
        this.users = [];
      }
    });
  }

  selectUser(user: User) {
    console.log('Selecting user:', user);
    this.selectedUser = user;
    this.loadConversation(user.id);
  }

  loadConversation(userId: string) {
    console.log('Loading conversation between users:', this.currentUser.id, userId);
    this.chatService.getConversation(this.currentUser.id, userId)
      .subscribe({
        next: (messages) => {
          console.log('Received messages:', messages);
          if (messages && Array.isArray(messages)) {
            this.messages = messages.map(msg => ({
              ...msg,
              sender: msg.sender || { id: '', name: '' },
              receiver: msg.receiver || { id: '', name: '' },
              timestamp: msg.timestamp || new Date()
            }));
            console.log('Processed messages:', this.messages);
          } else {
            console.log('No messages received or invalid format');
            this.messages = [];
          }
        this.markMessagesAsRead(userId);
        },
        error: (error) => {
          console.error('Error loading conversation:', error);
          this.messages = [];
        }
      });
  }

  loadUnreadMessages() {
    this.chatService.getUnreadMessages(this.currentUser.id)
      .subscribe({
        next: (messages) => {
          console.log('Unread messages:', messages);
        },
        error: (error) => {
          console.error('Error loading unread messages:', error);
        }
      });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUser) return;

    const message: Partial<ChatMessage> = {
      sender: this.currentUser,
      receiver: this.selectedUser,
      content: this.newMessage,
      timestamp: new Date(),
      read: false
    };

    console.log('Sending message to user:', this.selectedUser.name);
    this.chatService.sendMessage(message)
      .subscribe({
        next: (newMessage) => {
          if (newMessage) {
            console.log('Message sent successfully:', newMessage);
        this.messages.push(newMessage);
        this.newMessage = '';
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
        }
      });
  }

  markMessagesAsRead(senderId: string) {
    this.chatService.markMessagesAsRead(this.currentUser.id, senderId)
      .subscribe({
        error: (error) => {
          console.error('Error marking messages as read:', error);
        }
      });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
} 