import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

interface Categoria {
  id?: number;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriaSeleccionada: Categoria = { nombre: '', descripcion: '' };
  mostrarFormulario: boolean = false;
  private apiUrl = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listarCategorias();
  }

  listarCategorias() {
    this.http.get<Categoria[]>(this.apiUrl, { withCredentials: true }).subscribe({
      next: data => this.categorias = data,
      error: err => console.error('Error al cargar categorías:', err)
    });
  }

  agregarCategoria() {
    this.categoriaSeleccionada = { nombre: '', descripcion: '' };
    this.mostrarFormulario = true;
  }

  editarCategoria(categoria: Categoria) {
    this.categoriaSeleccionada = { ...categoria }; // Clonar para evitar mutaciones
    this.mostrarFormulario = true;
  }

  guardarCategoria() {
    if (this.categoriaSeleccionada.id) {
      // Editar
      this.http.put(`${this.apiUrl}/${this.categoriaSeleccionada.id}`, this.categoriaSeleccionada, { withCredentials: true }).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.listarCategorias();
        },
        error: err => console.error('Error al actualizar categoría:', err)
      });
    } else {
      // Crear
      this.http.post<Categoria>(this.apiUrl, this.categoriaSeleccionada, { withCredentials: true }).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.listarCategorias();
        },
        error: err => console.error('Error al crear categoría:', err)
      });
    }
  }


    eliminarCategoria(id: number) {
      Swal.fire({
        title: '¿Estás seguro de eliminar esta categoría?',
        text: 'Esta acción eliminará la categoría permanentemente.',
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
                text: 'La categoría fue eliminada correctamente.'
              });
              this.listarCategorias();
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
                  text: 'Ocurrió un error al eliminar la categoría.'
                });
              }
              console.error('Error al eliminar categoría:', err);
            }
          });
        }
      });
    }
    
    

  cancelar() {
    this.mostrarFormulario = false;
    this.categoriaSeleccionada = { nombre: '', descripcion: '' };
  }
}
