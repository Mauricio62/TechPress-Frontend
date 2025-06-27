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



interface Categoria {
  id?: number;
  nombre: string;
}

interface Proveedor {
  id?: number;
  nombre: string;
}

interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: Categoria;
  proveedor: Proveedor;
}

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  proveedores: Proveedor[] = [];
  productoSeleccionado: Producto = { nombre: '', precio: 0, stock: 0, categoria: { nombre: '' }, proveedor: { nombre: '' } };
  mostrarFormulario: boolean = false;
  private apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listarProductos();
    this.listarCategorias();
    this.listarProveedores();
  }

  listarProductos() {
    this.http.get<Producto[]>(this.apiUrl, { withCredentials: true }).subscribe({
      next: data => this.productos = data,
      error: err => console.error('Error al cargar productos:', err)
    });
  }

  listarCategorias() {
    this.http.get<Categoria[]>('http://localhost:8080/api/categorias', { withCredentials: true }).subscribe({
      next: data => this.categorias = data,
      error: err => console.error('Error al cargar categorías:', err)
    });
  }

  listarProveedores() {
    this.http.get<Proveedor[]>('http://localhost:8080/api/proveedores', { withCredentials: true }).subscribe({
      next: data => this.proveedores = data,
      error: err => console.error('Error al cargar proveedores:', err)
    });
  }

  agregarProducto() {
    this.productoSeleccionado = { nombre: '', precio: 0, stock: 0, categoria: { nombre: '' }, proveedor: { nombre: '' } };
    this.mostrarFormulario = true;
  }

  editarProducto(producto: Producto) {
    this.productoSeleccionado = { ...producto };
    this.mostrarFormulario = true;
  }

  guardarProducto() {
    if (this.productoSeleccionado.id) {
      this.http.put(`${this.apiUrl}/${this.productoSeleccionado.id}`, this.productoSeleccionado, { withCredentials: true }).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.listarProductos();
        },
        error: err => console.error('Error al actualizar producto:', err)
      });
    } else {
      this.http.post<Producto>(this.apiUrl, this.productoSeleccionado, { withCredentials: true }).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.listarProductos();
        },
        error: err => console.error('Error al crear producto:', err)
      });
    }
  }


    eliminarProducto(id: number) {
      Swal.fire({
        title: '¿Estás seguro de eliminar este producto?',
        text: 'Esta acción eliminará el producto permanentemente.',
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
                text: 'El producto fue eliminado correctamente.'
              });
              this.listarProductos();
            },
            error: err => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al eliminar el producto.'
              });
              console.error('Error al eliminar producto:', err);
            }
          });
        }
      });
    }

  cancelar() {
    this.mostrarFormulario = false;
    this.productoSeleccionado = { nombre: '', precio: 0, stock: 0, categoria: { nombre: '' }, proveedor: { nombre: '' } };
  }




exportarPDF() {
  const doc = new jsPDF();

  
  doc.setTextColor(44, 62, 80); 
  doc.setFontSize(16); 
  doc.text("Listado de Productos", doc.internal.pageSize.width / 2, 15, { align: "center" });

  // Configurar datos de la tabla
  const columnas = ['ID', 'Nombre', 'Precio', 'Stock', 'Categoría', 'Proveedor'];
  const filas = this.productos.map(p => [
    p.id ?? '',
    p.nombre ?? '',
    p.precio ? `$${p.precio}` : '', 
    p.stock ?? '',
    p.categoria?.nombre ?? '',
    p.proveedor?.nombre ?? ''
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

  const nombreArchivo = `productos_${formatoFechaHora}.pdf`;

  doc.save(nombreArchivo);
}




exportarExcel(): void {
  const data = this.productos.map(p => ({
    ID: p.id ?? '',
    Nombre: p.nombre ?? '',
    Precio: p.precio ?? '',
    Stock: p.stock ?? '',
    Categoría: p.categoria?.nombre ?? '',
    Proveedor: p.proveedor?.nombre ?? '',
  }));

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Productos': worksheet },
    SheetNames: ['Productos']
  };

  const now = new Date();
  const fechaHora = now.toISOString()
    .slice(0, 19)
    .replace('T', '_')
    .replace(/:/g, '-');

  const nombreArchivo = `productos_${fechaHora}.xlsx`;
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  FileSaver.saveAs(blob, nombreArchivo);
}

}

