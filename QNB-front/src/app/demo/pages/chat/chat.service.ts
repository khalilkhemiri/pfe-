import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Client } from '@stomp/stompjs';

export interface ChatMessage {
  id: string;
  sender: { id: string; name: string; };
  receiver: { id: string; name: string; };
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/chat';
  private stompClient: Client | null = null;
  private messagesSubject = new Subject<ChatMessage>();
  public messages$ = this.messagesSubject.asObservable();
  private currentUserId: string;
  private connected = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  initializeUser(userId: string) {
    this.currentUserId = userId;
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        login: 'guest',
        passcode: 'guest',
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      this.connected.next(true);
      this.subscribeToMessages();
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      this.connected.next(false);
    };

    this.stompClient.activate();
  }

  private subscribeToMessages() {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe(`/user/${this.currentUserId}/queue/messages`, (message) => {
        const chatMessage = JSON.parse(message.body);
        console.log('Received message via WebSocket:', chatMessage);
        this.messagesSubject.next(chatMessage);
      });
    }
  }

  getConversation(currentUserId: string, otherUserId: string): Observable<ChatMessage[]> {
    console.log('Fetching conversation between users:', currentUserId, otherUserId);
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversation/${currentUserId}/${otherUserId}`);
  }

  getUnreadMessages(userId: string): Observable<ChatMessage[]> {
    console.log('Fetching unread messages for user:', userId);
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/unread/${userId}`);
  }

  sendMessage(message: Partial<ChatMessage>): Observable<ChatMessage> {
    console.log('Sending message:', message);
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message)
      });
    }
    // On ne retourne plus la réponse HTTP car on utilise le WebSocket
    return new Observable<ChatMessage>(observer => {
      observer.complete();
    });
  }

  markMessagesAsRead(currentUserId: string, senderId: string): Observable<any> {
    console.log('Marking messages as read:', currentUserId, senderId);
    return this.http.post(`${this.apiUrl}/read/${currentUserId}/${senderId}`, {});
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected.next(false);
    }
  }
} 