import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';
// Importamos el servicio de autenticación
import { Router } from '@angular/router'; // Para redirigir después de cerrar sesión
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';  // Importa CommonModule
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  private logoutUrl = 'http://localhost:8080/logout';

  constructor(private http: HttpClient, private router: Router) {}

  onLogout(): void {
    this.http.post(this.logoutUrl, {}, { withCredentials: true }).subscribe({
      next: () => {
        console.log('Logout exitoso');
        this.router.navigate(['/login']); // Redirige al login tras cerrar sesión
      },
      error: err => {
        console.error('Error al cerrar sesión:', err);
        this.router.navigate(['/login']); // Aun con error, redirige por seguridad
      }
    });
  }
}
  


