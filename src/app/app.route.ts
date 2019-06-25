import { RouterModule, Routes } from '@angular/router';
import { ContenidoComponent } from './component/contenido/contenido.component';
import { LoginComponent } from './component/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthLoginGuard } from './guards/auth-login.guard';
import { CrearRutaComponent } from './component/crear-ruta/crear-ruta.component';
import { ChatComponent } from './component/chat/chat.component';
import { PedidosComponent } from './component/pedidos/pedidos.component';



const ROUTES: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [AuthLoginGuard] },
    { path: 'contenido', component: ContenidoComponent, canActivate: [AuthGuard] },
    { path: 'crearRuta', component: CrearRutaComponent, canActivate: [AuthGuard] },
    { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
    { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard] },
    { path: '**', pathMatch:'full', redirectTo: 'contenido' }
];

export const APPROUTING = RouterModule.forRoot(ROUTES, {useHash:true});
