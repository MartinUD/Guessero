import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicService } from '../basic-service.service';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-white">
      <h2>Test Component</h2>
      <p *ngIf="loading">Loading...</p>
      <p *ngIf="error">{{ error }}</p>
      <p *ngIf="data">{{ data }}</p>
      <button (click)="fetchData()">Retry</button>
    </div>
  `
})
export class TestComponent implements OnInit {
  data: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private basicService: BasicService) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    this.error = null;
    this.data = null;

    
  }
}