import { Component } from '@angular/core';
import { AuthService } from '../auth.service'; // Importamos el servicio de autenticación
import { Router } from '@angular/router'; // Para redirigir después de cerrar sesión
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';  // Importa CommonModule
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule], // 👈 Asegúrate de incluir RouterOutlet aquí
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout exitoso');
        this.router.navigate(['/login']);  // Redirige al login después de logout
      },
      error: (error) => {
        console.error('Error en logout', error);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated(); // Verifica si el usuario está autenticado
  }
}
