import { Component, ViewChild} from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LoginVerificacionService } from 'src/app/services/login-verificacion.service';
import { SeguirService } from 'src/app/services/seguir.service';
import {faBinoculars, faTimesCircle, faShareSquare, faComments, faKey } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { VerificarService } from '../../services/verificar.service';

import {MatMenuTrigger} from '@angular/material'
import { BuscarService } from '../../services/buscar.service';

import { ClipboardService } from 'ngx-clipboard'

@Component({
  selector: 'app-contenido',
  templateUrl: './contenido.component.html',
  styleUrls: ['./contenido.component.css']
})
export class ContenidoComponent {

  //Variables declaradas
  faBinoculars = faBinoculars;
  faKey = faKey;
  faComments = faComments;
  faShareSquare = faShareSquare;
  faTimesCircle = faTimesCircle;
  siguiendo:any = false;
  login:boolean= false;
  deliverys: any[] = [];
  lat: number = 51.678418;
  lng: number = 7.809007;
  private nombre:string;
  private clave:string;
  nombreConductor: string = null;
  claveConductor: string = null;
  init:boolean = false;
  documentId : AngularFirestoreCollection<any>;
  claveCompartir: string;
  compartir: boolean = false;
  conductores:any[];
  conductoresSub:Subscription;
  online:boolean;
  isCopiado:boolean = false;
  isDirection:boolean = false;
  latBuscar:number;
  lngBuscar:number;

  formatAddress = "";

  options= {
    componentRestrictions: { country: 'CL' }
  }
  
  origin:any;
  destination:any;
  directionSub:Subscription;

  icon = {
    url: 'https://cdn4.iconfinder.com/data/icons/map-pins-2/256/13-512.png',
    scaledSize: {
      width: 50,
      height: 70
    }
  }

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

  constructor(public db:AngularFirestore, public aRouter:ActivatedRoute, 
              public loginSer:LoginVerificacionService, public seguirSer:SeguirService,
              public verificarSer: VerificarService, public buscarSer:BuscarService,
              public copySer: ClipboardService) {

    //Traemos los parametros que nos entrega LoginComponent
/*     this.aRouter.params.subscribe(params=>{
      this.nombre = params['nombre'];
      this.clave = params['clave'];
    }); */

      this.nombre = localStorage.getItem('nombre');
      this.clave = localStorage.getItem('clave');

/*     this.verificarSer.changeEmitted$.subscribe(datos =>{
      console.log(datos.nombre);
      this.nombre = datos.nombre;
      this.clave = datos.clave;
    }); */


    //Iniciamos el servicio de seguir que a su vez trae un evento cambio desde el MainNavComponent
    // al cual nos subscribimos y extraemos la latitud y longitus y se la asignamos a "this.lat" y "this.lng"
    this.seguirSer.changeEmitted$.subscribe(conductor=>{
     /*   this.lat = conductor.lat;
        this.lng = conductor.lng; */
        this.origin = null;
        this.destination = null;
        console.log(conductor);
        this.lat = conductor.lat;
        this.lng = conductor.lng;
        this.nombreConductor = conductor.nombre;
        this.claveConductor = conductor.clave;
        
        this.db.collection(`${this.nombre}`).doc('web').collection(`${this.clave}`).doc(`${this.claveConductor}`).valueChanges().subscribe((data:any)=>{
            this.compartir = data.compartir;
            this.claveCompartir = data.clave_compartir;
            console.log(data);
        });
        console.log(this.lat, this.lng);

        this.db.collection(`${this.nombre}`).doc('movil').collection('usuarios').doc(`${this.claveConductor}`).valueChanges().subscribe((data:any)=>{
              this.online = data.online;
        });
    });

    this.conductoresSub = this.db.collection(`${this.nombre}`).doc('movil').collection('usuarios').valueChanges().subscribe((data:any[])=>{
          this.conductores = data;
          
          console.log(this.conductores);

    });
    
    

    
    //Console Log de los datos actuales
    console.log(this.lat, this.lng);

    //Escuchamos los cambios originados en la base de datos de firebase, indicando la jerarquia de la coleccion
    //y los documentos
    db.collection(`${this.nombre}`).doc('web').collection(`${this.clave}`).valueChanges()
            //Nos subscribimos a la respuesta 
          .subscribe((data: any[])=>{
            //asigamos el resultado a nuestra variable "this.deliverys"
              this.deliverys = data;
              if(!this.init){
                this.lat = data['0']['lat'];
                this.lng = data['0']['lng'];
                this.init = true;
              }

              if(this.claveConductor){
                data.forEach(conductor =>{                
                    if(conductor.clave == this.claveConductor){
                      this.lat = conductor.lat;
                      this.lng = conductor.lng;
                    }
                });
              }
              console.log(this.deliverys);
              
    });

    this.buscarSer.changeEmitted$.subscribe(data=>{
      this.latBuscar = data.lat;
      this.lngBuscar = data.lng;

      this.lat = this.latBuscar;
      this.lng = this.lngBuscar;

      this.conductores.push({
        lat: this.lat,
        lng: this.lat,
        nombre: "hola"
      });

    });
 
   }

   //FIN CONSTRUCTOR

   //METODOS
          
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
              this.db.collection(`${this.nombre}`).doc(`movil`).collection(`usuarios`).doc(`${this.claveConductor}`).collection('pedidos').add({
                  direccion: this.direccion,
                  nombre: this.nombreCliente,
                  entregado: false,
                  numeroTelefono: this.numeroTelefonoCliente,
                  repartidor: this.nombreConductor,
                  tipoPedido: this.tipoPedido,
                  montoTotal: this.montoTotalPagar
              });
          }
          if(result.dismiss){
              console.log("Cancelar Clickeado");
          }
    });
   }
  
    
   getDirection() {
    
    this.isDirection = true;
    console.log(this.lat,this.lng);
    this.directionSub = this.db.collection(`${this.nombre}`).doc('movil').collection('usuarios').doc(`${this.claveConductor}`).valueChanges().subscribe((data:any)=>{
         console.log(data)
         this.lat = data.lat;
         this.lng = data.lng;
    })
    
    this.origin = { lat: this.lat, lng: this.lng };
    this.destination = { lat: this.latBuscar, lng: this.lngBuscar };
   }

   exitDirection(){
     this.origin = null;
     this.destination = null;
     this.isDirection = false;
     this.directionSub.unsubscribe();
   }

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

  openMyMenu() {
    this.matMenuTrigger.openMenu();

  } 
  closeMyMenu() {
    this.matMenuTrigger.closeMenu();
  }
  
   dejarDeSeguir(){

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
    
    Toast.fire({
      type: 'warning',
      title: `dejando de seguir a ${this.nombreConductor}`
    });
        this.nombreConductor = null;
        this.claveConductor = null;
        this.claveCompartir = null;

   }

   compartirRuta(){

      let data = {
        nombre: this.nombreConductor,
        lat: this.lat,
        lng: this.lng,
        imagen: "asdasd",
        clave: this.claveConductor,
        empresa: this.nombre,
        compartir: true
      }

      this.db.collection(`${this.nombre}`).doc('cliente').collection('rooms').add(data).then( (docRef) =>{
        
        /*  this.documentId = this.db.collection(`${this.nombre}`).doc('cliente').collection('rooms');
        this.documentId.get().subscribe(data=>{
          this.claveCompartir = data['docs']['0']['id'];
          console.log(this.claveCompartir);
          console.log("agregado con exito");
          Swal.fire("Comparte este codigo con tus clientes", `${this.claveCompartir}`, "success");
          console.log(data);
        }); */
        console.log(docRef.id);

        Swal.fire({
          title: "Compartir este codigo con sus clientes",
          text: `${docRef.id}`,
          type: "success",
          position: "top",
          allowOutsideClick: false
          
        }).then(()=>{

            this.db.collection(`${this.nombre}`).doc('web').collection(`${this.clave}`).doc(`${this.claveConductor}`).update({
                compartir: true
            });
            this.db.collection(`${this.nombre}`).doc('movil').collection(`usuarios`).doc(`${this.claveConductor}`).update({
              compartir: true
            });
            
            this.db.collection(`${this.nombre}`).doc('web').collection(`${this.clave}`).doc(`${this.claveConductor}`).update({
              clave_compartir: this.claveCompartir
            });
            this.db.collection(`${this.nombre}`).doc('movil').collection(`usuarios`).doc(`${this.claveConductor}`).update({
              clave_compartir: this.claveCompartir
            });

            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
            
            Toast.fire({
              type: 'success',
              title: `se está compartiendo la ruta de ${this.nombreConductor}`
            });

            

          });

          this.claveCompartir = docRef.id;
          
      });
   }

   dejarDeCompartir(){
     Swal.fire({
       title: "¿Está seguro?",
       text: `esto eliminará la actual ruta de ${this.nombreConductor}`,
       type: "warning",
       position: "top",
       showCancelButton: true,
       cancelButtonColor: '#d33',
       allowOutsideClick: false
     }).then((result)=>{

      if(result.value){

        this.db.collection(`${this.nombre}`).doc('cliente').collection('rooms').doc(`${this.claveCompartir}`).delete().then(()=>{
          this.compartir = false;
          
          this.db.collection(`${this.nombre}`).doc('web').collection(`${this.clave}`).doc(`${this.claveConductor}`).update({
              compartir: false,
              clave_compartir: ""
          });
          this.db.collection(`${this.nombre}`).doc('movil').collection(`usuarios`).doc(`${this.claveConductor}`).update({
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

   abrirMarcador(){
     console.log("marcadorClickeado");
   }


}
