import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import {FormControl,FormGroup , Validators, FormBuilder} from '@angular/forms';
import Swal from 'sweetalert2';
import { faDollarSign, faBinoculars,faStickyNote, faUser, faPhone, faMapMarker, faCar } from '@fortawesome/free-solid-svg-icons';
import { AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { VerDireccionClienteService } from '../../services/ver-direccion-cliente.service';

export function removeSpaces(control: AbstractControl) {
  if (control && control.value && !control.value.replace(/\s/g, '').length) {
    control.setValue('');
  }
  return null;
}

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
  nombre:string;
  pedidos:any [];
  pedidoFormulario : FormGroup;
  selected:any;
  latPedido: number;
  lngPedido: number;
  pedidosEntregados :any[];
  pedidosActivos : any[];
  conductores: any[];

  pedidosActivosTotal:number;
  pedidosEntregadosTotal:number;
  
  valorFormulario:any;
  formattedAddres:string;
  options= {
    componentRestrictions: { country: 'CL' }
  }


  constructor(public db:AngularFirestore, public _bottomSheet:MatBottomSheet, public formBuilder: FormBuilder, public auth: AuthService) {
    if(localStorage.getItem('nombre')){
      this.nombre = localStorage.getItem('nombre');
    }
    console.log(this.nombre);

  /*   this.db.collection('locales').doc(`${this.nombre}`).collection('pedidos').valueChanges().subscribe(data=>{
      if(data){
          this.pedidos = data;
      }
    }); */

    this.auth.getPedidos(this.nombre).subscribe((data:any[])=>{
      this.pedidos = data;
      this.pedidosActivos = this.pedidos.filter(pedido => pedido.entregado === false);
      this.pedidosEntregados = this.pedidos.filter(pedido => pedido.entregado === true);
      this.pedidosActivosTotal = this.pedidosActivos.length;
      this.pedidosEntregadosTotal = this.pedidosEntregados.length;
    });

    this.auth.getConductores(this.nombre).subscribe((data:any[])=>{
        this.conductores = data;
    });
   }

   

  ngOnInit() {
    this.pedidoFormulario = this.formBuilder.group({
      clave_conductor: new FormControl('', [Validators.required]),
      direccionCliente: new FormControl('', [Validators.required, Validators.minLength(4), removeSpaces]),
      nombreCliente : new FormControl('',[Validators.required, Validators.minLength(2), removeSpaces]),
      numeroTelefono : new FormControl('', [Validators.required, Validators.maxLength(7), Validators.minLength(2)]),
      tipoPedido : new FormControl('',[Validators.required, Validators.minLength(2), removeSpaces]),
      totalPagar : new FormControl('',[Validators.required, Validators.minLength(2)])
    });
  }

  openBottomSheet(pedido:any): void {
    this._bottomSheet.open(BottomSheetOverviewExampleSheet, {data: {data_pedido: pedido}});
    console.log(pedido);
  }

  handleAddressChange(address: Address){
    this.latPedido = address.geometry.location.lat();
    this.lngPedido = address.geometry.location.lng();
    console.log(this.latPedido);
    console.log(this.lngPedido);
    console.log(address.formatted_address);
    this.formattedAddres = address.formatted_address;
  }

  verDireccion(){
    console.log(this.pedidoFormulario.get('direccionCliente').value);
  }

  crearPedido(input:any){
    let conductorFiltrado: any;
    let nombreConductor: any;
    let apellidoConductor: any;
    console.log("Crear Pedido Activado");
    console.log(input);
    this.valorFormulario = input;
    console.log(this.valorFormulario);
    conductorFiltrado = this.conductores.filter(conductor => conductor.clave === this.valorFormulario.clave_conductor);
    console.log(conductorFiltrado);
    nombreConductor = conductorFiltrado['0'].nombre;
    apellidoConductor = conductorFiltrado['0'].apellido;
    console.log(nombreConductor, apellidoConductor);
    this.db.collection('locales').doc(`${this.nombre}`).collection('pedidos').add({
      direccion: this.formattedAddres,
      entregado: false,
      montoTotal: this.valorFormulario.totalPagar,
      nombre: this.valorFormulario.nombreCliente,
      numeroTelefono: this.valorFormulario.numeroTelefono,
      clave_repartidor: this.valorFormulario.clave_conductor,
      repartidor: `${nombreConductor} ${apellidoConductor}`,
      tipoPedido: this.valorFormulario.tipoPedido,
      pedidoLat: this.latPedido,
      pedidoLng: this.lngPedido
    }).then(data=>{
      if(data.id){
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        
        Toast.fire({
          type: 'success',
          title: `Se creo un nuevo pedido con ID ${data.id}`
        });

        this.pedidoFormulario.patchValue({
          direccionCliente: "",
          nombreCliente: "",
          numeroTelefono: "",
          tipoPedido: "",
          totalPagar: ""
        });

        this.db.collection('locales').doc(`${this.nombre}`).collection('movil').doc(`${this.valorFormulario.clave_conductor}`).collection('pedidos').add({
          direccion: this.formattedAddres,
          entregado: false,
          montoTotal: this.valorFormulario.totalPagar,
          nombre: this.valorFormulario.nombreCliente,
          numeroTelefono: this.valorFormulario.numeroTelefono,
          clave_repartidor: this.valorFormulario.clave_conductor,
          repartidor: `${nombreConductor} ${apellidoConductor}`,
          tipoPedido: this.valorFormulario.tipoPedido,
          pedidoLat: this.latPedido,
          pedidoLng: this.lngPedido,
          idGeneral: data.id
        }).then(data=>{
              let id:any;
              id = data.id;
              console.log(id);
              this.db.collection('locales').doc(`${this.nombre}`).collection('movil').doc(`${this.valorFormulario.clave_conductor}`).collection('pedidos').doc(`${id}`).update({
                idPedidoConductor: id
              });
        });
      }
    });
  }


}


@Component({
  selector: 'bottom-sheet-overview-example-sheet',
  templateUrl: 'bottom-sheet-overview-example-sheet.html',
})
export class BottomSheetOverviewExampleSheet {

  faUser = faUser;
  faPhone = faPhone;
  faMapMarker = faMapMarker;
  faCar= faCar;
  faStickyNote = faStickyNote;
  faDollarSign = faDollarSign;
  faBinoculars = faBinoculars;
  pedidoLat:number;
  pedidoLng:number;

  constructor(public auth:AuthService, public verDireccion:VerDireccionClienteService , public route:Router, private _bottomSheetRef: MatBottomSheetRef<BottomSheetOverviewExampleSheet>, 
    @Inject(MAT_BOTTOM_SHEET_DATA) public pedido: any) {
      console.log(pedido.data_pedido.nombre);
      
    }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  abrirMapa(){
    console.log('abrir mapa activado');
    console.log(this.pedido.data_pedido.pedidoLat);
    console.log(this.pedido.data_pedido.pedidoLng);
    this.verDireccion.emitChange({
        pedidoLat: this.pedido.data_pedido.pedidoLat,
        pedidoLng: this.pedido.data_pedido.pedidoLng
    });
    this.route.navigateByUrl('/contenido', );
  }

  
}
