import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface PartyMember {
  id: string;
  username?: string;
  isHost?: boolean;
}

export interface PartyMessage {
  type: string;
  payload?: any;
  message?: string;
  partyId?: string;
  members?: Omit<PartyMember, "id">[];
  parties?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BasicService {
  private socket: WebSocket;
  public parties$ = new BehaviorSubject<string[]>([]);
  private members$ = new BehaviorSubject<Omit<PartyMember, "id">[]>([]);
  private currentParty$ = new BehaviorSubject<string | null>(null);

  constructor() {
    this.socket = new WebSocket('ws://localhost:8000');
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      const message: PartyMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'party_list':
          this.parties$.next(message.parties || []);
          console.log(this.parties$.getValue());
          break;
        case 'party_created':
          this.currentParty$.next(message.partyId || null);
          this.members$.next(message.members || []);
          break;
        case 'error':
          console.error('WebSocket error:', message.message);
          break;
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  createParty(partyId: string, username: string, isVisable: boolean): void {
    this.socket.send(JSON.stringify({
      type: 'create_party',
      partyId: partyId,
      username: username,
      isPrivate: isVisable     
    }));
  }

  leaveParty(partyId: string): void {
    this.socket.send(JSON.stringify({
      type: 'leave_party',
      partyId: partyId
    }));
    this.currentParty$.next(null);
    this.members$.next([]);
  }

  listParties(): void {
    this.socket.send(JSON.stringify({
      type: 'list_parties'
    })); 
  }
} 