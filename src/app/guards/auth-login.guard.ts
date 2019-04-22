import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginVerificacionService } from '../services/login-verificacion.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthLoginGuard implements CanActivate {

  login:boolean;
  nombre:string;
  clave:string;

  constructor(private router: Router,  private loginSer: LoginVerificacionService, public db: AngularFirestore ){

  }
  canActivate(){

    if(sessionStorage.getItem('login') === "true"){
      this.login = true;
    }else{
      this.login = false;
    }

    this.nombre = localStorage.getItem('nombre');
    this.clave = localStorage.getItem('clave');

    if(!this.login){
      return true;
    }else{
        this.router.navigate(['/contenido']);
        return false;
    }
        
  }
      
  
}
