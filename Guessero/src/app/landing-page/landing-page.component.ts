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
    partyIsPrivate = false;
    private subscriptions: Subscription[] = []
  
    constructor(private BasicService: BasicService) {}
  
    ngOnInit() {

    }
  
    ngOnDestroy() {
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }
  
    createParty(inputPartyID: string) {
      this.partyId = inputPartyID;
      if (this.partyId && this.username) {
        this.BasicService.createParty(this.partyId, this.username);
      }
    }
  
    listParties() {
      this.BasicService.listParties();
    }
} 