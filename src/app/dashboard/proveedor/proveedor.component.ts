import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { saveAs } from "file-saver";

interface Proveedor {
  id?: number;
  nombre: string;
  telefono: string;
  email: string;
  ruc: string;
}

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './proveedor.component.html',
  styleUrl: './proveedor.component.css'
})
export class ProveedorComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedorSeleccionado: Proveedor = { nombre: '', telefono: '', email: '', ruc: '' };
  mostrarFormulario: boolean = false;
  private apiUrl = 'http://localhost:8080/api/proveedores';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listarProveedores();
  }

  listarProveedores() {
    this.http.get<Proveedor[]>(this.apiUrl, { withCredentials: true }).subscribe({
      next: data => this.proveedores = data,
      error: err => console.error('Error al cargar proveedores:', err)
    });
  }

  agregarProveedor() {
    this.proveedorSeleccionado = { nombre: '', telefono: '', email: '', ruc: '' }; // Limpiar datos
    this.mostrarFormulario = true;
  }

  editarProveedor(proveedor: Proveedor) {
    this.proveedorSeleccionado = { ...proveedor }; // Copia para evitar mutación directa
    this.mostrarFormulario = true;
  }

  guardarProveedor() {
    if (this.proveedorSeleccionado.id) {
      // Editar
      this.http.put(`${this.apiUrl}/${this.proveedorSeleccionado.id}`, this.proveedorSeleccionado, { withCredentials: true }).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.listarProveedores();
        },
        error: err => console.error('Error al actualizar proveedor:', err)
      });
    } else {
      // Crear
      this.http.post<Proveedor>(this.apiUrl, this.proveedorSeleccionado, { withCredentials: true }).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.listarProveedores();
        },
        error: err => console.error('Error al crear proveedor:', err)
      });
    }
  }

 
  eliminarProveedor(id: number | undefined) {
      if (id === undefined || id === null) {
        console.error('ID de proveedor no válido');
        return;
      }
    
      Swal.fire({
        title: '¿Estás seguro de eliminar este proveedor?',
        text: 'Esta acción eliminará el proveedor permanentemente.',
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
                text: 'El proveedor fue eliminado correctamente.'
              });
              this.listarProveedores();
            },
            error: err => {
              if (err.status === 409) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: err.error || 'No se puede eliminar el proveedor porque está asociado a productos.'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Ocurrió un error al eliminar el proveedor.'
                });
              }
              console.error('Error al eliminar proveedor:', err);
            }
          });
        }
      });
    }
    

  cancelar() {
    this.mostrarFormulario = false;
    this.proveedorSeleccionado = { nombre: '', telefono: '', email: '', ruc: '' };
  }


exportarPDF() {
  const doc = new jsPDF();

  // Configurar título centrado y con color
  doc.setTextColor(44, 62, 80); // Establecer color oscuro
  doc.setFontSize(16); // Tamaño más grande
  doc.text("Listado de Proveedores", doc.internal.pageSize.width / 2, 15, { align: "center" });

  // Configurar datos de la tabla
  const columnas = ['ID', 'Nombre', 'Teléfono', 'Email', 'RUC'];
  const filas = this.proveedores.map(p => [
    p.id ?? '',
    p.nombre ?? '',
    p.telefono ?? '',
    p.email ?? '',
    p.ruc ?? ''
  ]);

  // Insertar tabla debajo del título
  autoTable(doc, {
    head: [columnas],
    body: filas,
    theme: 'grid',
    headStyles: { fillColor: [44, 62, 80], textColor: 255 }, // Color oscuro en encabezado y texto blanco
    startY: 20 // Posicionar tabla debajo del título
  });

  // Generar nombre dinámico para el archivo
  const now = new Date();
  const formatoFechaHora = 
    `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_` +
    `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

  const nombreArchivo = `proveedores_${formatoFechaHora}.pdf`;

  doc.save(nombreArchivo);
}


exportarExcel(): void {
  const data = this.proveedores.map(p => ({
    ID: p.id ?? '',
    Nombre: p.nombre ?? '',
    Telefono: p.telefono ?? '',
    Email: p.email ?? '',
    Ruc: p.ruc ?? '',
  }));

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Proveedores': worksheet },
    SheetNames: ['Proveedores']
  };

  const now = new Date();
  const fechaHora = now.toISOString()
    .slice(0, 19)
    .replace('T', '_')
    .replace(/:/g, '-');

  const nombreArchivo = `proveedores_${fechaHora}.xlsx`;
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  FileSaver.saveAs(blob, nombreArchivo);
}
}
