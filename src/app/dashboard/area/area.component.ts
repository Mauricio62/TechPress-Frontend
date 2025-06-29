import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';


interface Area {
  id?: number;
  nomarea: string;
}

@Component({
  selector: 'app-area',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './area.component.html',
  styleUrl: './area.component.css'
})
export class AreaComponent implements OnInit {
  areas: Area[] = [];
  areaSeleccionada: Area = { nomarea: '' };
  mostrarFormulario: boolean = false;
  private apiUrl = 'http://localhost:8080/api/areas';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listarAreas();
  }

  listarAreas() {
    this.http.get<Area[]>(this.apiUrl, { withCredentials: true }).subscribe({
      next: data => this.areas = data,
      error: err => console.error('Error al cargar áreas:', err)
    });
  }

  agregarArea() {
    this.areaSeleccionada = { nomarea: '' };
    this.mostrarFormulario = true;
  }

  editarArea(area: Area) {
    this.areaSeleccionada = { ...area }; 
    this.mostrarFormulario = true;
  }

guardarArea() {
  const nombre = this.areaSeleccionada.nomarea?.trim();

  if (!nombre) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo vacío',
      text: 'El nombre del área es obligatorio.',
    });
    return;
  }

  if (this.areaSeleccionada.id) {
    // Editar
    this.http.put(`${this.apiUrl}/${this.areaSeleccionada.id}`, this.areaSeleccionada, { withCredentials: true }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El área fue actualizada correctamente.',
        });
        this.mostrarFormulario = false;
        this.listarAreas();
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al actualizar el área.'
        });
        console.error('Error al actualizar área:', err);
      }
    });
  } else {
    // Crear
    this.http.post<Area>(this.apiUrl, this.areaSeleccionada, { withCredentials: true }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'El área se creó correctamente.',
        });
        this.mostrarFormulario = false;
        this.listarAreas();
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al crear el área.'
        });
        console.error('Error al crear área:', err);
      }
    });
  }
}


    eliminarArea(id: number) {
      Swal.fire({
        title: '¿Estás seguro de eliminar esta área?',
        text: 'No podrás revertir esto.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-danger',  
          cancelButton: 'btn btn-secondary'
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true }).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El área fue eliminada correctamente.'
              });
              this.listarAreas();
            },
            error: err => {
              if (err.status === 409) {
                Swal.fire({
                  icon: 'error',
                  title: 'No se puede eliminar',
                  text: err.error 
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Ocurrió un error al eliminar el área.'
                });
              }
            }
          });
        }
      });
    }
    

  cancelar() {
    this.mostrarFormulario = false;
    this.areaSeleccionada = { nomarea: '' };
  }
}
