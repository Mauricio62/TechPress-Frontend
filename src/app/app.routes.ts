import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { CategoriaComponent } from './dashboard/categoria/categoria.component';
import { ProveedorComponent } from './dashboard/proveedor/proveedor.component';
import { AreaComponent } from './dashboard/area/area.component';
import { EmpleadoComponent } from './dashboard/empleado/empleado.component';
import { ProductoComponent } from './dashboard/producto/producto.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent }, 
      { path: 'categoria', component: CategoriaComponent },
      { path: 'proveedor', component: ProveedorComponent },
      { path: 'area', component: AreaComponent },
      { path: 'empleado', component: EmpleadoComponent },
      { path: 'producto', component: ProductoComponent }
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
