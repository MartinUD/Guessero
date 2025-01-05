import { BasicService } from '../basic-service.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms'; // Add this for ngModel
import { CommonModule } from '@angular/common'; // Add this for ngFor

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, CommonModule], // Add these modules
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit, OnDestroy {
    partyId = 'badadan';
    username = '';
    Private = false;
    private subscriptions: Subscription[] = []
    parties: any[] = []; 
    searchingParties = false;
  
    constructor(private BasicService: BasicService) {}
  
    ngOnInit() {
      const partiesSub = this.BasicService.parties$.subscribe(parties => {
          this.parties = parties;
      });
      this.subscriptions.push(partiesSub);
      
      // Initial load of parties
      this.listParties();
  }
  
    ngOnDestroy() {
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }
  
    createParty(inputPartyID: string) {
      this.partyId = inputPartyID;
      if (this.partyId && this.username) {
        this.BasicService.createParty(this.partyId, this.username);
      }
      this.listParties();
    }
  
    listParties() {
      this.BasicService.listParties();
    }
} 