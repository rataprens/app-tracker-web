import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { ContenidoComponent } from './component/contenido/contenido.component';

import { AgmCoreModule } from '@agm/core';

import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';

import { AngularFirestoreModule } from '@angular/fire/firestore';
import { LoginComponent } from './component/login/login.component';

import { FormsModule } from '@angular/forms';
import { APPROUTING } from './app.route';
import { AuthService } from './services/auth.service';

import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatBadgeModule, MatFormFieldModule, MatChipsModule ,MatInputModule,MatButtonModule, MatCheckboxModule, MatToolbarModule,
         MatSidenavModule, MatIconModule, MatListModule, MatIconRegistry,MatDialogModule, 
         MatMenuModule, MatExpansionModule, MatGridListModule, MatCardModule,
        MatOptionModule, MatSelectModule, MatBottomSheetModule, MatTabsModule, MatPaginatorModule, MatTableModule} from '@angular/material';
import { MainNavComponent } from './component/main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginVerificacionService } from './services/login-verificacion.service';
import { SeguirService } from './services/seguir.service';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { BuscarService } from './services/buscar.service';

import { ClipboardModule } from 'ngx-clipboard';
import { AgmDirectionModule } from 'agm-direction';
import { CambiarTemaService } from './services/cambiar-tema.service';
import { ChatComponent } from './component/chat/chat.component';
import { CrearRutaComponent } from './component/crear-ruta/crear-ruta.component';
import { PedidosComponent, BottomSheetOverviewExampleSheet, DialogOverviewExampleDialog2 } from './component/pedidos/pedidos.component';

import { ReactiveFormsModule } from '@angular/forms';
import { VerDireccionClienteService } from './services/ver-direccion-cliente.service';
import { HttpClientModule } from "@angular/common/http";
import { CentroControlComponent, DialogOverviewExampleDialog } from './component/centro-control/centro-control.component';
import { SimplebarAngularModule } from 'simplebar-angular';
import { AgregarNuevoProductoService } from './services/agregar-nuevo-producto.service';
import { ReportesComponent } from './component/reportes/reportes.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ContenidoComponent,
    LoginComponent,
    MainNavComponent,
    ChatComponent,
    CrearRutaComponent,
    PedidosComponent,
    BottomSheetOverviewExampleSheet,
    CentroControlComponent,
    DialogOverviewExampleDialog,
    DialogOverviewExampleDialog2,
    ReportesComponent
  ],
  imports: [
    BrowserModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCNrSxTaaXtAZy3Wtucs6voOjCxJGpuujM',
      libraries: ['places']
    }),
    HttpClientModule,
    AgmDirectionModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    FormsModule,
    APPROUTING,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    FontAwesomeModule,
    MatMenuModule,
    GooglePlaceModule,
    MatInputModule,
    ClipboardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatExpansionModule,
    MatGridListModule,
    MatCardModule,
    MatOptionModule,
    MatSelectModule,
    MatBottomSheetModule,
    MatTabsModule,
    MatPaginatorModule,
    MatTableModule,
    SimplebarAngularModule,
    MatDialogModule
  ],
  entryComponents: [BottomSheetOverviewExampleSheet, PedidosComponent, DialogOverviewExampleDialog, DialogOverviewExampleDialog2],
  providers: [
    AuthService,
    LoginVerificacionService,
    SeguirService,
    BuscarService,
    CambiarTemaService,
    BottomSheetOverviewExampleSheet,
    VerDireccionClienteService,
    AgregarNuevoProductoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry:MatIconRegistry){
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
}
