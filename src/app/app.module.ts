import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { ContenidoComponent } from './component/contenido/contenido.component';
import { MapaComponent } from './component/mapa/mapa.component';

import { AgmCoreModule } from '@agm/core';

import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';

import { AngularFirestoreModule } from '@angular/fire/firestore';
import { LoginComponent } from './component/login/login.component';

import { FormsModule } from '@angular/forms';
import { APPROUTING } from './app.route';
import { AuthService } from './services/auth.service';

import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatBadgeModule, MatFormFieldModule, MatChipsModule ,MatInputModule,MatButtonModule, MatCheckboxModule, MatToolbarModule, MatSidenavModule, MatIconModule, MatListModule, MatIconRegistry, MatMenuModule} from '@angular/material';
import { MainNavComponent } from './component/main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoginVerificacionService } from './services/login-verificacion.service';
import { SeguirService } from './services/seguir.service';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { BuscarService } from './services/buscar.service';

import { ClipboardModule } from 'ngx-clipboard';
import { AgmDirectionModule } from 'agm-direction';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ContenidoComponent,
    MapaComponent,
    LoginComponent,
    MainNavComponent
  ],
  imports: [
    BrowserModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCNrSxTaaXtAZy3Wtucs6voOjCxJGpuujM',
      libraries: ['places']
    }),
    AgmDirectionModule,
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
    MatBadgeModule
  ],
  providers: [
    AuthService,
    LoginVerificacionService,
    SeguirService,
    BuscarService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry:MatIconRegistry){
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
}
