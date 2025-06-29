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


interface Empleado {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  fecha_contrato: string;
  area: {
    id: number;
    nomarea: string;
  };
}

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './empleado.component.html',
  styleUrl: './empleado.component.css'
})
export class EmpleadoComponent implements OnInit {
  empleados: Empleado[] = [];
  areas: { id: number; nomarea: string }[] = [];
  empleadoSeleccionado: Empleado = {
    nombre: '',
    apellido: '',
    email: '',
    fecha_contrato: '',
    area: { id: 0, nomarea: '' }
  };
  mostrarFormulario: boolean = false;
  filtro: string = '';

  private apiUrl = 'http://localhost:8080/api/empleados';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listarEmpleados();
    this.listarAreas();
  }

  listarEmpleados() {
    this.http.get<Empleado[]>(this.apiUrl, { withCredentials: true }).subscribe({
      next: data => this.empleados = data,
      error: err => console.error('Error al cargar empleados:', err)
    });
  }

  obtenerEmpleadosFiltrados(): Empleado[] {
  const filtroLower = this.filtro.toLowerCase();

  return this.empleados.filter(e =>
    e.nombre.toLowerCase().includes(filtroLower) ||
    e.apellido.toLowerCase().includes(filtroLower) ||
    e.email.toLowerCase().includes(filtroLower) ||
    e.area?.nomarea.toLowerCase().includes(filtroLower) 
  );
}


  listarAreas() {
    this.http.get<{ id: number; nomarea: string }[]>('http://localhost:8080/api/areas', { withCredentials: true }).subscribe({
      next: data => this.areas = data,
      error: err => console.error('Error al cargar áreas:', err)
    });
  }

  agregarEmpleado() {
    this.empleadoSeleccionado = {
      nombre: '',
      apellido: '',
      email: '',
      fecha_contrato: '',
      area: { id: 0, nomarea: '' }
    };
    this.mostrarFormulario = true;
  }

  editarEmpleado(empleado: Empleado) {
    this.empleadoSeleccionado = { ...empleado };
    this.mostrarFormulario = true;
  }

guardarEmpleado() {
  const { nombre, apellido, email, fecha_contrato, area } = this.empleadoSeleccionado;

  if (!nombre?.trim() || !apellido?.trim() || !email?.trim() || !fecha_contrato?.trim() || !area?.id) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Todos los campos son obligatorios, incluyendo el área.',
    });
    return;
  }

  if (this.empleadoSeleccionado.id) {
    // Editar
    this.http.put(`${this.apiUrl}/${this.empleadoSeleccionado.id}`, this.empleadoSeleccionado, { withCredentials: true }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El empleado fue actualizado correctamente.'
        });
        this.mostrarFormulario = false;
        this.listarEmpleados();
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al actualizar el empleado.'
        });
        console.error('Error al actualizar empleado:', err);
      }
    });
  } else {
    // Crear
    this.http.post<Empleado>(this.apiUrl, this.empleadoSeleccionado, { withCredentials: true }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'El empleado se creó correctamente.'
        });
        this.mostrarFormulario = false;
        this.listarEmpleados();
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al crear el empleado.'
        });
        console.error('Error al crear empleado:', err);
      }
    });
  }
}

 
    eliminarEmpleado(id: number) {
      Swal.fire({
        title: '¿Estás seguro de eliminar este empleado?',
        text: 'Esta acción eliminará el empleado permanentemente.',
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
                text: 'El empleado fue eliminado correctamente.'
              });
              this.listarEmpleados();
            },
            error: err => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al eliminar el empleado.'
              });
              console.error('Error al eliminar empleado:', err);
            }
          });
        }
      });
    }
    

  cancelar() {
    this.mostrarFormulario = false;
    this.empleadoSeleccionado = {
      nombre: '',
      apellido: '',
      email: '',
      fecha_contrato: '',
      area: { id: 0, nomarea: '' }
    };
  }

  exportarPDF() {
  const doc = new jsPDF();

  // Configurar título centrado y con color
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(16); 
  doc.text("Listado de Empleados", doc.internal.pageSize.width / 2, 15, { align: "center" });

  // Configurar datos de la tabla
  const columnas = ['ID', 'Nombre', 'Apellido', 'Email', 'Fecha_Contrato', 'Área'];
  const filas = this.empleados.map(p => [
    p.id ?? '',
    p.nombre ?? '',
    p.apellido ?? '',
    p.email ?? '',
    p.fecha_contrato ?? '',
    p.area?.nomarea ?? ''
  ]);

  // Insertar tabla debajo del título
  autoTable(doc, {
    head: [columnas],
    body: filas,
    theme: 'grid',
    headStyles: { fillColor: [44, 62, 80], textColor: 255 }, 
    startY: 20 // Posicionar tabla debajo del título
  });

  // Generar nombre dinámico para el archivo
  const now = new Date();
  const formatoFechaHora = 
    `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_` +
    `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

  const nombreArchivo = `empleados_${formatoFechaHora}.pdf`;

  doc.save(nombreArchivo);
}



exportarExcel(): void {
  const data = this.empleados.map(e => ({
    ID: e.id ?? '',
    Nombre: e.nombre ?? '',
    Apellido: e.apellido ?? '',
    Email: e.email ?? '',
    Fecha_Contrato: e.fecha_contrato ?? '',
    Area: e.area?.nomarea ?? '',
      
  }));

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Empleados': worksheet },
    SheetNames: ['Empleados']
  };

  const now = new Date();
  const fechaHora = now.toISOString()
    .slice(0, 19)
    .replace('T', '_')
    .replace(/:/g, '-');

  const nombreArchivo = `empleados_${fechaHora}.xlsx`;
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  FileSaver.saveAs(blob, nombreArchivo);
}


}
