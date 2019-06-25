import { Component, ViewChild, OnInit } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginVerificacionService } from 'src/app/services/login-verificacion.service';
import { SeguirService } from 'src/app/services/seguir.service';
import {faBinoculars, faTimesCircle, faSearch,faShareSquare, faComments, faKey, faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { VerificarService } from '../../services/verificar.service';

import {MatMenuTrigger} from '@angular/material'
import { BuscarService } from '../../services/buscar.service';

import { ClipboardService } from 'ngx-clipboard'
import { AuthService } from '../../services/auth.service';

import { CambiarTemaService } from '../../services/cambiar-tema.service';
import { EliminarMarkerService } from '../../services/eliminar-marker.service';
import { VerDireccionClienteService } from '../../services/ver-direccion-cliente.service';

interface InfoEmpresa {
  direccion: string,
  lat: number,
  lng: number,
  nombre: string,
  numeroTelefono: number,
  password: string,
  tipo: string,
  tipoPlan: string
}

@Component({
  selector: 'app-contenido',
  templateUrl: './contenido.component.html',
  styleUrls: ['./contenido.component.css']
})
export class ContenidoComponent {

  //Variables declaradas

  breakpoint: number;

  //FONT AWESOME
  faSearch = faSearch;
  faMapMarkedAlt = faMapMarkedAlt;
  faBinoculars = faBinoculars;
  faKey = faKey;
  faComments = faComments;
  faShareSquare = faShareSquare;
  faTimesCircle = faTimesCircle;
  //CONDUCTOR
  nombreConductor: string;
  apellidoConductor: string;
  claveConductor: string;
  compartir: boolean = false;
  claveCompartir: string;
  conductores:any[];
  online:boolean;
  //SUBSCRIPCIONES
  conductoresSub:Subscription;
  directionSub:Subscription;
  //OTRAS VARIABLES
  siguiendo:any = false;
  login:boolean= false;
  lat: number = 51.678418;
  lng: number = 7.809007;
  private nombre:string;
  private clave:string;
  init:boolean = false;
  documentId : AngularFirestoreCollection<any>;
  isCopiado:boolean = false;
  isDirection:boolean = false;
  latBuscar:number;
  lngBuscar:number;
  formatAddress = "";
  options= {
    componentRestrictions: { country: 'CL' }
  }
  pedidos:any[];
  isBuscar:boolean = false;
  pedidosActivos:any[];
  estado:string;
  origin:any;
  destination:any;
  pedidoLat: number;
  pedidoLng: number;
  verDireccionActivado: boolean = false;
  public renderOptions = {
    suppressMarkers: true,
  }
  waypoints: any[] = [];
  public markerOptions = {
    origin: {
        draggable: false,
        opacity: 0
    },
    destination: {
        opacity: 1,
        draggable: true
    },
    waypoints: {
      draggable:false,
      icon: ""
    }
  }

  icon = {
    url: 'https://cdn4.iconfinder.com/data/icons/map-pins-2/256/13-512.png',
    scaledSize: {
      width: 50,
      height: 70
    }
  }
  buscarDireccion:boolean = false;
  labelOptions = {
    color: 'blue',
    fontFamily: '',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: 'o.5px'
  }
  direccion:string;
  nombreCliente:string;
  numeroTelefonoCliente:number;
  montoTotalPagar:number;
  tipoPedido:string;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;

  style:any;
  direccionBusqueda: direccionBusqueda;
  map:any;

  infoEmpresa: InfoEmpresa;

  constructor(public db:AngularFirestore, public aRouter:ActivatedRoute, 
              public loginSer:LoginVerificacionService, public seguirSer:SeguirService,
              public verificarSer: VerificarService, public buscarSer:BuscarService,
              public copySer: ClipboardService, public auth:AuthService, 
              public cambiarTemaService:CambiarTemaService, public eliminarMarker:EliminarMarkerService,
              public router: Router, public verDireccion:VerDireccionClienteService) {

    this.nombre = localStorage.getItem('nombre');
    this.clave = localStorage.getItem('clave');
    this.estado = localStorage.getItem('estado');

    if(this.estado){
      if(this.estado == 'dia'){
        let tema_dia  = require('src/app/jsonfiles/theme_dia.json');
        console.log('JSON CARGADO TEMA DIA',tema_dia);
        this.style = tema_dia;
      }else{
        let tema_noche = require('src/app/jsonfiles/theme_noche.json');
        console.log('JSON CARGADO TEMA NOCHE',tema_noche);
        this.style = tema_noche;
      }
    }else{
      let tema_dia = require('src/app/jsonfiles/theme_dia.json');
      console.log('NO EXISTE VARIABLE ESTADO EN EL LOCAL STORAGE, PERO SE CARGARA EL TEMA DE DIA', tema_dia)
      this.style = tema_dia;
    }

    //Iniciamos el servicio de seguir que a su vez trae un evento cambio desde el MainNavComponent
    // al cual nos subscribimos y extraemos la latitud y longitus y se la asignamos a "this.lat" y "this.lng"
    this.seguirSer.changeEmitted$.subscribe(conductor=>{
      /* 
        this.origin = null;
        this.destination = null; */
        this.lat = conductor.lat;
        this.lng = conductor.lng;
        this.map.setCenter({lat: this.lat, lng:this.lng});
        this.map.setZoom(17);
        this.nombreConductor = conductor.nombre;
        this.apellidoConductor = conductor.apellido;
        this.claveConductor = conductor.clave;
        this.compartir = conductor.compartir;
        this.claveCompartir = conductor.clave_compartir;
        this.online = conductor.online;
        console.log(conductor);
    });

    this.cambiarTemaService.changeEmitted$.subscribe((resultado:any) =>{
      if(resultado.estado == 'noche'){
        console.log("cambiando style a NightTheme");
        let tema_noche = require('src/app/jsonfiles/theme_noche.json');
        this.style = tema_noche;
        localStorage.setItem('estado', 'noche');

      }else{
        let tema_dia = require('src/app/jsonfiles/theme_dia.json');
        console.log("cambiando style a DayTheme");
        this.style = tema_dia;
        localStorage.setItem('estado', 'dia');
      }
    });

    this.verDireccion.changeEmitted$.subscribe(data=>{
        console.log(data);
        this.pedidoLat = data.pedidoLat;
        this.pedidoLng = data.pedidoLng;
        this.verDireccionActivado = true
        console.log(this.verDireccionActivado);
        this.map.setCenter({lat:this.pedidoLat, lng:this.pedidoLng});
    });

    this.conductoresSub = this.auth.getConductores(this.nombre).subscribe((conductores:any[])=>{
      
      this.conductores = conductores;
      
      if(!this.init){

        this.lat = conductores['0']['lat'];
        this.lng = conductores['0']['lng'];
        this.init = true;
        console.log('ver direccion no activado');
      }

      if(this.claveConductor){
        conductores.forEach(conductor =>{                
            if(conductor.clave == this.claveConductor){
              this.lat = conductor.lat;
              this.lng = conductor.lng;
            }
        });
      }
      
      this.origin = { lat: this.lat, lng: this.lng };
      console.log(this.conductores);
    });


    this.buscarSer.changeEmitted$.subscribe(data=>{
      this.latBuscar = data.lat;
      this.lngBuscar = data.lng;
      this.map.setCenter({lat:this.latBuscar, lng:this.lngBuscar});
      this.map.setZoom(17);
      this.buscarDireccion = true;
      this.isBuscar = true;
      console.log(this.latBuscar, this.lngBuscar);
    });

    this.eliminarMarker.changeEmitted$.subscribe(data=>{
      console.log(data);
      this.buscarDireccion = false;
      this.latBuscar = null;
      this.lngBuscar = null;
      this.isBuscar = false;
      this.map.setCenter({lat:this.lat, lng:this.lng});
      this.map.setZoom(17);
    });

    this.auth.getPedidos(this.nombre).subscribe((data:any[])=>{
        if(data){
          this.pedidos = data;
          this.pedidosActivos = this.pedidos.filter(pedido => pedido.entregado == false);
          console.log('si hay datos de pedidos');
        }else{
          console.log('no hay datos de pedidos');
        }
    });

    this.db.collection('locales').doc(`${this.nombre}`).valueChanges().subscribe((data:InfoEmpresa)=>{
      if(data){
        this.infoEmpresa = data;
        console.log(this.infoEmpresa);
      }else{
        console.log('no hay info de local');
      }
    });
 
  }

  //FIN CONSTRUCTOR

  //METODOS

  mapReady(map){
    this.map = map;
    console.log(this.map);
  }
  
  //Abrir Menu
  openMyMenu() {
    this.matMenuTrigger.openMenu();
    
  } 

  //Cerrar Menu
  closeMyMenu() {
    this.matMenuTrigger.closeMenu();
  }
  
  //Asignar pedido a un conductor    
  asignarPedido(){
    Swal.fire({
      title: "Debe Ingresar los siguientes datos",
      text: `Asignara el siguiente pedido a ${this.nombreConductor}`,
      type: "info",
      position: "top",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      customClass: {
        container: 'container-class'
      },
      focusConfirm: true,
      heightAuto: true,
      allowOutsideClick: false,
      html: `<input id="direccion" class="swal2-input" placeholder="Dirección">`+
            `<input id="nombreCliente" class="swal2-input" placeholder="Nombre de cliente">`+
            `<input id="numeroTelefono" class="swal2-input" placeholder="Numero de telefono">` +
            `<input id="repartidor" class="swal2-input" value="${this.nombreConductor}">`+
            `<input id="tipoPedido" class="swal2-input" placeholder="tipo pedido">` +
            `<input id="montoTotal" class="swal2-input" placeholder="Total a Pagar">`
    }).then((result)=>{
          if(result.value === true){
              console.log("Aceptar Clickeado");
              this.direccion = (<HTMLInputElement>document.getElementById('direccion')).value;
              this.nombreCliente = (<HTMLInputElement>document.getElementById('nombreCliente')).value;
              this.numeroTelefonoCliente = parseInt(((<HTMLInputElement>document.getElementById('numeroTelefono')).value));
              this.tipoPedido = (<HTMLInputElement>document.getElementById('tipoPedido')).value;
              this.montoTotalPagar = parseInt(((<HTMLInputElement>document.getElementById('montoTotal')).value));
              console.log(this.direccion, this.nombreCliente, this.numeroTelefonoCliente, this.tipoPedido, this.montoTotalPagar);
              this.db.collection(`locales`).doc(`${this.nombre}`).collection(`movil`).doc(`${this.claveConductor}`).collection('pedidos').add({
                  direccion: this.direccion,
                  nombre: this.nombreCliente,
                  entregado: false,
                  numeroTelefono: this.numeroTelefonoCliente,
                  repartidor: this.nombreConductor,
                  tipoPedido: this.tipoPedido,
                  montoTotal: this.montoTotalPagar,
                  clave_reparto: this.claveConductor
              });
          }
          if(result.dismiss){
              console.log("Cancelar Clickeado");
          }
    });
  }
  
  //Crear Ruta Optima segun los pedidos asignados al repartidor
  getDirection() {
    const Toast = Swal.mixin({
      toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });

    Toast.fire({
      type: 'success',
      title: `Ruta optimizada asignada a ${this.nombreConductor} ${this.apellidoConductor}`
    });
    console.log(this.infoEmpresa);
    this.isDirection = true;
    this.origin = { lat: this.lat, lng: this.lng };
    for(var pedido of this.pedidosActivos){
      this.waypoints.push({
        location: {lat: pedido.pedidoLat, lng: pedido.pedidoLng},
        stopover: false
      })
    }
    this.destination = { lat: this.infoEmpresa.lat, lng: this.infoEmpresa.lng };
    
  }
//Crear ruta optima segun la direccion buscada
  getDirectionSearchPoint(){
    const Toast = Swal.mixin({
      toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });

    Toast.fire({
      type: 'success',
      title: `Trazado de ruta solicitada`
    });
    this.isDirection = true;
    this.waypoints = [];
    this.origin ={lat: this.lat, lng:this.lng};
    this.destination = {lat:this.latBuscar, lng: this.lngBuscar};
  }
  
  //Salir de modo ruta
  exitDirection(){
    const Toast = Swal.mixin({
      toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });

    Toast.fire({
      type: 'warning',
      title: `Saliendo de la ruta optimizada`
    });
    this.origin = null;
    this.destination = null;
    this.isDirection = false;
    this.map.setCenter({lat:this.lat, lng:this.lng});
    this.map.setZoom(16);
  }
  
  //Copiar al portapapeles
  copy(){
    this.copySer.copyFromContent(this.claveCompartir);

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
    
    Toast.fire({
      type: 'success',
      title: 'Copiado al Portapapeles!'
    })
    
  }

  //Dejar de seguir
  dejarDeSeguir(){

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  
    Toast.fire({
      type: 'warning',
      title: `dejando de seguir a ${this.nombreConductor} ${this.apellidoConductor}`
    });

    this.nombreConductor = null;
    this.claveConductor = null;
    this.claveCompartir = null;

  }
  //Compartir la ruta del conductor
   compartirRuta(){

      let ruta = {
        nombre: this.nombreConductor,
        apellido: this.apellidoConductor,
        lat: this.lat,
        lng: this.lng,
        clave: this.claveConductor,
        empresa: this.nombre,
        compartir: true
      }
      console.log(this.nombre);
      console.log(ruta);
      console.log(this.claveConductor);
      this.db.collection('locales').doc(`${this.nombre}`).collection('rooms').add(ruta).then( (docRef)=>{
            if(docRef.id){
              Swal.fire({
                title: "Compartir este codigo con sus clientes",
                text: `${docRef.id}`,
                type: "success",
                position: "top",
                allowOutsideClick: false
                
              }).then(()=>{

                this.db.collection('locales').doc(`${this.nombre}`).collection('movil').doc(`${this.claveConductor}`).update({
                  compartir: true,
                  clave_compartir: docRef.id
                });

                const Toast = Swal.mixin({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 3000
                });
                
                Toast.fire({
                  type: 'success',
                  title: `se está compartiendo la ruta de ${this.nombreConductor} ${this.apellidoConductor}`
                });

                this.compartir = true;
                this.claveCompartir = docRef.id;
              });
            }else{
              console.log("no se agrego correctamente");
            }
      } );
   }

   dejarDeCompartir(){
     Swal.fire({
       title: "¿Está seguro?",
       text: `esto eliminará la actual ruta de ${this.nombreConductor} ${this.apellidoConductor}`,
       type: "warning",
       position: "top",
       showCancelButton: true,
       cancelButtonColor: '#d33',
       allowOutsideClick: false
     }).then((result)=>{

      if(result.value){

        this.db.collection('locales').doc(`${this.nombre}`).collection('rooms').doc(`${this.claveCompartir}`).delete().then(()=>{
          this.compartir = false;
          
          this.db.collection('locales').doc(`${this.nombre}`).collection('movil').doc(`${this.claveConductor}`).update({
              compartir: false,
              clave_compartir: ""
          });

        }).catch(error=>{
          console.log(error);
        });
  
        const Toast = Swal.mixin({
         toast: true,
         position: 'top-end',
         showConfirmButton: false,
         timer: 3000
       });
       
       Toast.fire({
         type: 'warning',
         title: `se dejo de compartir la ruta de ${this.nombreConductor}`
       });
       
      }else{
        return false;
      }

     });
   }

   abrirChat(){
      console.log(this.claveCompartir);
      this.db.collection(`${this.nombre}`).doc('cliente').collection('rooms').doc(`${this.claveCompartir}`).valueChanges().subscribe(data=>{
        console.log(data);
      });
      
   }

   abrirMarcador(marcador:any){
     console.log("marcadorClickeado");
     console.log(marcador);
   }

   public change(event: any) {
    this.waypoints = event.request.waypoints;
  }

}

interface direccionBusqueda {
  lat: number;
  lng: number;
}