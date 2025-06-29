import { Component } from '@angular/core';
import { AuthService } from '../auth.service'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  



@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        this.router.navigate(['/dashboard/home']);  // Redirige al home después de login
      },
      error: (error) => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
        console.error('Error de login', error);
      }
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout exitoso');
        localStorage.removeItem('auth_token'); 
        document.cookie = 'JSESSIONID=;expires=Thu, 01 Jan 1970 00:00:00 GMT'; 
        this.router.navigate(['/login']);  
      },
      error: (error) => {
        console.error('Error en el logout', error);
      }
    });
  }
}
