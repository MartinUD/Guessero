import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http
      .get<TestResponse>(this.apiUrl, { headers })
      .pipe(
        map((response: TestResponse) => response.message)
      );
  }
}