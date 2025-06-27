import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/login';  
  private logoutUrl = 'http://localhost:8080/logout';  

  constructor(private http: HttpClient) {}

  // Método para iniciar sesión
  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    return this.http.post(this.apiUrl, body.toString(), { headers, withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error('Error en el login', error);
          return throwError(error);
        })
      );
  }

  // Método para cerrar sesión
  logout(): Observable<any> {
    return this.http.post(this.logoutUrl, {}, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error('Error en el logout', error);
          return throwError(error);
        })
      );
  }

  isAuthenticated(): boolean {
    const sessionCookie = document.cookie.includes('JSESSIONID');
    return sessionCookie;
  }
}
