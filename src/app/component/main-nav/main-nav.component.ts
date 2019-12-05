import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {MediaMatcher} from '@angular/cdk/layout';
import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import { faMapMarkerAlt, faChartBar,faStickyNote, faDesktop,faMapMarkedAlt, faBars, faSun, faMoon, faFileAlt,faTimesCircle, faSearch, faCoffee,faAlignJustify,faPowerOff,faCarAlt,faComments,faUser,faPhone,faAlignLeft, faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { LoginVerificacionService } from 'src/app/services/login-verificacion.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { SeguirService } from 'src/app/services/seguir.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { BuscarService } from '../../services/buscar.service';
import Swal from 'sweetalert2';
import { CambiarTemaService } from '../../services/cambiar-tema.service';
import { EliminarMarkerService } from '../../services/eliminar-marker.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';



@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnDestroy{
  faMapMarkerAlt = faMapMarkerAlt;
  faStickyNote = faStickyNote;
  faMapMarkedAlt =faMapMarkedAlt;
  faMoon = faMoon;
  faChartBar = faChartBar;
  faSun = faSun;
  icono = faSun;
  faBars = faBars;
  faFileAlt = faFileAlt;
  faTimesCircle = faTimesCircle;
  valor:string;
  faSearch = faSearch;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faDesktop = faDesktop;
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
  conductores: any[];
  seguirA:boolean = false;
  online: boolean = false;
  conductoresSub:Subscription;
  mostrarSub: Subscription;
  pedidos: any[];
  pedidoTotal:number;
  pedidosSub: Subscription;
  lat:number;
  lng:number;
  estadoDia:string;
  abrirMenuActivado:boolean;
  conductoresConectados: any[];
  totalConductores:number;
  totalConectados:number;
  options= {
    componentRestrictions: { country: 'CL' }
  };
  

  private _mobileQueryListener: () => void;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver,
     changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
      public loginSer:LoginVerificacionService,
      public router: Router, public auth:AuthService, public db:AngularFirestore,
      public seguirSer:SeguirService, public buscarSer: BuscarService, 
      public cambiarTemaService:CambiarTemaService, public eliminarMarker:EliminarMarkerService,
      public iconRegistry: MatIconRegistry, public sanitizer: DomSanitizer,) {

    this.estadoDia = 'dia';
    this.icono = faSun;
    
    if(localStorage.getItem('estado')){
      console.log("existe en el local storage el estado");
      if(localStorage.getItem('estado') == 'noche'){
        console.log("El estado es NOCHE");
        this.estadoDia = 'noche';
        this.icono = faMoon;
      }else{
        console.log("El estado es Dia");
        this.estadoDia = 'dia';
        this.icono = faSun;
      }
    }else{
      console.log("no existe en el local storage el estado");
      this.estadoDia = 'dia';
        this.icono = faSun;
    }

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    if(sessionStorage.getItem('login') === "true"){
      this.login = true;
      this.nombre = localStorage.getItem('nombre');
      this.clave = localStorage.getItem('clave');

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
/*       this.conductoresSub = this.db.collection(`${this.nombre}`).doc('movil').collection(`usuarios`).valueChanges().subscribe(data =>{
        console.log(data);
        this.conductores = data;
      }); */

      this.conductoresSub = this.auth.getConductores(this.nombre).subscribe((data:any[])=>{
        if(data){
          this.conductores = data;
          console.log(data);
        }else{
          console.log("no hay datos");
        }
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

  cerrar_menu(snav:any){
    snav.close();
  }

  shouldRun = true;

  irRutaOptima(){
    this.router.navigateByUrl('/crearRuta');
  }

  cambiarTema(){
    if(this.icono === faSun){
      this.estadoDia = "Noche";
      this.icono = faMoon;
      this.cambiarTemaService.emitChange({
        estado: 'noche'
      });
      console.log("tema de noche activado");
    }else{
      this.icono = faSun;
      this.estadoDia = "Dia";
      this.cambiarTemaService.emitChange({
        estado: 'dia'
      });
      console.log("tema de dia activado");
    }
  }

  
  mostrarConductores(){
    
    console.log(this.nombre, this.clave, this.login);
    this.mostrarSub = this.auth.getConductores(this.nombre).subscribe((data:any[])=>{
      if(data){
          this.conductores = data;
      }else{
        console.log("no hay data desde el evento mostrarConductores");
      }
    });
    
    if(this.mostrar == false){
      this.mostrar = true;
    }else{
      this.mostrar = false;
    }
    console.log(this.conductores);
    
  }

  //METODO QUE EMITE UN CAMBIO EN EL CONTENIDO
  seguir(conductor:any){

    //enviamos un conductor de conductores
    this.seguirSer.emitChange({
      nombre: conductor.nombre,
      apellido: conductor.apellido,
      clave: conductor.clave,
      empresa: conductor.empresa,
      lat: conductor.lat,
      lng: conductor.lng,
      online: conductor.online,
      compartir: conductor.compartir,
      clave_compartir: conductor.claveCompartir
    });
    this.router.navigateByUrl('/contenido');
  }

handleAddressChange(address: Address){
  console.log(address.geometry.location.lng());
  console.log(address.geometry.location.lat());
  this.lat = address.geometry.location.lat();
  this.lng = address.geometry.location.lng();

  this.router.navigateByUrl('/contenido', {}).then(()=>{
  })
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
  this.eliminarMarker.emitChange({
    eliminarMarker: true
  });
}

  
logout(snav){
  snav.close();
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
      if(this.conductoresSub){
        this.conductoresSub.unsubscribe();
      }
      localStorage.removeItem('nombre');
      localStorage.removeItem('clave');
      localStorage.removeItem('estado');
      localStorage.removeItem('tipo_local');
      sessionStorage.removeItem('login');
      this.router.navigate(['/login']);
    }else{
      return false;
    }
  });

}

abrirMenu(snav: any){
  console.log("abrir menu");
  if(!this.abrirMenuActivado){    
    if(this.login){
      this.conductoresSub = this.auth.getConductores(this.nombre).subscribe((data:any[])=>{
        if(data){
            console.log(data);
            this.conductores = data;
            this.totalConductores = this.conductores.length;
            this.conductoresConectados = this.conductores.filter(conductor => conductor.online === true);
            this.totalConectados = this.conductoresConectados.length;
            snav.toggle();
            this.abrirMenuActivado = true;
            console.log('se activo el menu una vez');
            
        }else{
          console.log("no hay datos");
        }
      });

      this.auth.getPedidos(this.nombre).subscribe((data:any[])=>{
        this.pedidos = data;
        this.pedidoTotal = this.pedidos.length;
        console.log('se calculo la cantidad de pedidos');
      });

      this.iconRegistry.addSvgIcon(
        'iconoSuccess',
       this.sanitizer.bypassSecurityTrustResourceUrl('assets/svg/success.svg')
      );

      this.iconRegistry.addSvgIcon(
        'iconoError',
        this.sanitizer.bypassSecurityTrustResourceUrl('assets/svg/error.svg')
      );
    }
  }else{
    //// abrirmenuactivado es igual a true -> significa que ya se activo una vez el menu
    snav.toggle();
    console.log('ya no se hace la consulta a la BD');
    

  }
  
}
}
