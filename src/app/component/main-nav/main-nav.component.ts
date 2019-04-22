import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {MediaMatcher} from '@angular/cdk/layout';
import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {faTimesCircle, faSearch, faCoffee,faAlignJustify,faPowerOff,faCarAlt,faComments,faUser,faPhone,faAlignLeft, faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { LoginVerificacionService } from 'src/app/services/login-verificacion.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { SeguirService } from 'src/app/services/seguir.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { BuscarService } from '../../services/buscar.service';
import Swal from 'sweetalert2';




@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnDestroy{
  faTimesCircle = faTimesCircle;
  valor:string;
  faSearch = faSearch;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  login:boolean = false;
  faAlignLeft = faAlignLeft;
  faPhone = faPhone;
  faUser = faUser;
  faCarAlt = faCarAlt;
  faComments = faComments;
  faAlignJustify = faAlignJustify;
  faCoffee = faCoffee;
  faPowerOff = faPowerOff;
  mobileQuery: MediaQueryList;
  mostrar:boolean = false;
  nombre:string;
  clave:string;
  conductores: any;
  seguirA:boolean = false;
  online: boolean = false;
  conductoresSub:Subscription;
  mostrarSub: Subscription;

  lat:number;
  lng:number;

  private _mobileQueryListener: () => void;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver,
     changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
      public loginSer:LoginVerificacionService,
      public router: Router, public auth:AuthService, public db:AngularFirestore,
      public seguirSer:SeguirService, public buscarSer: BuscarService) {

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    if(sessionStorage.getItem('login') === "true"){
      this.login = true;
      this.nombre = localStorage.getItem('nombre');
      this.clave = localStorage.getItem('clave');
        
      this.conductoresSub = this.db.collection(`${this.nombre}`).doc('movil').collection(`usuarios`).valueChanges().subscribe(data =>{
        console.log(data);
        this.conductores = data;
      });

    }

    //Escuchamos los cambios realizados en login component
    this.loginSer.changeEmitted$.subscribe(valor=>{
      console.log(valor);
      //Seteamos los cambios realizados en el login component
      if(valor.login === "true"){
        this.login = true;
      }else{
        this.login =false;
      }
      this.nombre = valor.nombre;
      this.clave = valor.clave;
      console.log(this.nombre, this.clave);
      // Nos subscribimos a los valores de la coleccion usuarios y se lo asignamos a un array
      this.conductoresSub = this.db.collection(`${this.nombre}`).doc('movil').collection(`usuarios`).valueChanges().subscribe(data =>{
        console.log(data);
        this.conductores = data;
      });

/*       console.log(this.nombre, this.clave, this.login);
  
       this.conductores = this.db.collection(`${this.nombre}`).doc('movil').collection(`usuarios`).valueChanges().subscribe(data =>{
        console.log(data);
        this.conductores = data;
      }); */
   
    });


  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  shouldRun = true;

  
  mostrarConductores(){
    console.log("desde el evento mostrar conductores");
    console.log(this.nombre, this.clave, this.login);
    console.log(this.conductores);
    
      this.mostrarSub = this.db.collection(`${this.nombre}`).doc(`movil`).collection(`usuarios`).valueChanges().subscribe(data=>{
                                this.conductores = data;
                          });

    if(this.mostrar == false){
      this.mostrar = true;
    }else{
      this.mostrar = false;
    }
  }

  seguir(conductor:any){
    console.log(conductor);
    /*  this.loginSer.emitChange({
      login: true,
      nombre: this.nombre,
      clave: this.clave,
      lat: conductor.lat,
      lng: conductor.lng
    }); */
    
    this.seguirSer.emitChange({
      nombre: conductor.nombre,
      clave: conductor.clave,
      lat: conductor.lat,
      lng: conductor.lng,
      
    });
  }

  handleAddressChange(address: Address){
    console.log(address.geometry.location.lng());
    console.log(address.geometry.location.lat());
    this.lat = address.geometry.location.lat();
    this.lng = address.geometry.location.lng();
    this.buscarSer.emitChange({
      lat: this.lat,
      lng: this.lng
    });
}

onKeydown(){
  this.buscarSer.emitChange({
    lat: this.lat,
    lng: this.lng
  });
}

borrar(){
  this.valor= '';
  this.lat = null;
  this.lat = null;
}

  
  logout(){

    Swal.fire({
      title: "¿Está seguro?",
      text: "Desea Cerrar Sesión",
      type: "warning",
      position: "top",
      showCancelButton: true,
      cancelButtonColor: '#d33'
    }).then((result)=>{
      
      if(result.value){

        console.log("evento desde el logout");
        this.loginSer.emitChange({
          login : false,
          nombre: this.nombre,
          clave: this.clave
        });
        console.log(this.login);
        
        this.conductoresSub.unsubscribe();
        if(this.mostrarSub){
          this.mostrarSub.unsubscribe();
        }
        localStorage.removeItem('nombre');
        localStorage.removeItem('clave');
        sessionStorage.removeItem('login');
        this.router.navigate(['/login']);
      }else{
        return false;
      }
    });

  }
}
