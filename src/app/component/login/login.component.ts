import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ContenidoComponent } from '../contenido/contenido.component';
import { LoginVerificacionService } from 'src/app/services/login-verificacion.service';
import Swal from 'sweetalert2'
import { Button } from 'protractor';
import { VerificarService } from '../../services/verificar.service';
import { faEye ,faEyeSlash, faUser,faKey, faTimesCircle } from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faTimesCircle = faTimesCircle;
  faKey = faKey;
  faUser = faUser;
  login:boolean = true;
  nombre:string;
  clave:string;
  isMostrar:boolean = false;

  constructor(public verificarSer:VerificarService, public afDB:AngularFirestore, public _auth:AuthService, public router:Router,public loginSer:LoginVerificacionService) { }

  
  ngOnInit() {
    
  }

  ingresar(nombre:string, clave:string){

    if(!nombre || !clave ){
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });
      
      Toast.fire({
        type: 'warning',
        title: `Ingrese algun valor!`
      });
    }else{
      this._auth.verificarUsuario(nombre, clave).then(existe =>{
        if(existe){
          console.log("existe usuario");
          //METODO
          Swal.fire(`Bienvenido ${nombre}`, "¿Deseas Seguir?", "success").then(resultado=>{
            if(resultado){
  
              localStorage.setItem('nombre', this.nombre);
              localStorage.setItem('clave', this.clave);
              sessionStorage.setItem('login', "true");
  
              this.loginSer.emitChange({
                /* login: this.login, */
                login: sessionStorage.getItem('login'),
                nombre: localStorage.getItem('nombre'),
                clave: localStorage.getItem('clave')
              });
  
              /* sessionStorage.setItem('login', "true"); */
              
              this.router.navigate(['/contenido']);
            }else{
              return false;
            }
          })
          
        }else{
          console.log("no existe usuario");
          Swal.fire("Usuario o Password Incorrecta", "Ingrese denuevo sus datos", "warning");
        }
      });
    }

  }

  borrar(){
    this.nombre = "";
  }

  mostrar(){
    if(this.isMostrar){
      var input = document.getElementById('inputClave');
      input.setAttribute('type', 'password');
      this.isMostrar = false;
    }else{
      
      var input = document.getElementById('inputClave');
      input.setAttribute('type', 'text');
      this.isMostrar = true;
    }
  }


}
