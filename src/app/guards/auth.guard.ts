import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginVerificacionService } from '../services/login-verificacion.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

   login:boolean;
   nombre:string;
   clave:string;

  constructor(private route: Router, private loginSer: LoginVerificacionService){

  }

  canActivate(){

    if(sessionStorage.getItem('login') === "true"){
      this.login = true;
    }else{
      this.login = false;
    }

    this.nombre = localStorage.getItem('nombre');
    this.clave = localStorage.getItem('clave');

    if(this.login){
      return true;
    }else{
        this.route.navigate(['/login']);
        return false;
    }
  }
  
}
