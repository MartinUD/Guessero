import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface TestResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class BasicService {
  private apiUrl = 'http://localhost:8000/test';

  constructor(private http: HttpClient) { }

  getData(): Observable<string> {
    return this.http.get<TestResponse>(this.apiUrl).pipe(
      map(response => response.message)
    );
  }
}