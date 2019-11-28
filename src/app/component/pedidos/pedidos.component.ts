import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MAT_BOTTOM_SHEET_DATA, MatTableDataSource, MatPaginator, MatSelect, MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import {FormControl,FormGroup , Validators, FormBuilder} from '@angular/forms';
import Swal from 'sweetalert2';
import { faDollarSign, faBinoculars,faStickyNote, faUser, faPhone,  faCarAlt, faMapMarker, faCar, faPlusCircle, faCheckSquare, faClock} from '@fortawesome/free-solid-svg-icons';
import { AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { VerDireccionClienteService } from '../../services/ver-direccion-cliente.service';
import { AgregarNuevoProductoService } from 'src/app/services/agregar-nuevo-producto.service';
import { isNumber } from 'util';



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
  faClock = faClock;
  faCheckSquare = faCheckSquare;
  faPlusCircle = faPlusCircle;
  faStickyNote = faStickyNote;
  faUser = faUser;
  faCarAlt = faCarAlt;
  nombre: string;
  pedidos: any [];
  pedidoFormulario: FormGroup;
  selected: any;
  latPedido: number;
  lngPedido: number;
  pedidosEntregados: any[];
  pedidosActivos: any[];
  conductores: any[];
  pedidosNuevos: any = [];
  pedidosActivosTotal: number;
  pedidosEntregadosTotal: number;
  valorFormulario: any;
  formattedAddres: string;
  options = {
    componentRestrictions: { country: 'CL' }
  };
  precio_producto: number;
  columna_pedido_activo: string[] = ['nombre_cliente', 'telefono_cliente', 'repartidor', 'direccion', 'monto_total'];
  columna_pedido_realizado: string[] = ['nombre_cliente', 'telefono_cliente', 'repartidor', 'direccion', 'monto_total'];
  dataSource_pedidos_activos: any;
  dataSource_pedidos_realizados: any;

  @ViewChild('paginator_pedidos_activos') paginator_pedidos_activos: MatPaginator;
  @ViewChild('paginator_pedidos_realizados') paginator_pedidos_realizados: MatPaginator;

  tipo_local: string;

  constructor(public agregarNuevoProductoService:AgregarNuevoProductoService, public db:AngularFirestore, public _bottomSheet:MatBottomSheet, public dialog: MatDialog,public formBuilder: FormBuilder, public auth: AuthService) {
    if(localStorage.getItem('nombre')){
      this.nombre = localStorage.getItem('nombre');
    }
    this.db.collection('locales').doc(`${this.nombre}`).collection('pedidos').valueChanges().subscribe(data=>{ 
      var data_pedidos_activos:any = [];
      var data_pedidos_realizados:any = [];
      this.dataSource_pedidos_activos = [];
      this.dataSource_pedidos_realizados = [];

      this.agregarNuevoProductoService.changeEmitted$.subscribe(data=>{
        console.log(data);
        if(data.abrir_nuevo_producto){
          this.prepararPedido(data.tipo_producto);
        }
      })

      data.forEach((pedido:any) =>{
        console.log(pedido)
        if(pedido.entregado){
          data_pedidos_realizados.push(pedido)
          console.log('pedido entregado')
        }else{
          console.log('pedido activo')
          data_pedidos_activos.push(pedido);
        }
      });

      this.dataSource_pedidos_realizados = new MatTableDataSource<any>(data_pedidos_realizados);
      this.dataSource_pedidos_realizados.paginator = this.paginator_pedidos_realizados;

      this.dataSource_pedidos_activos = new MatTableDataSource<any>(data_pedidos_activos);
      this.dataSource_pedidos_activos.paginator = this.paginator_pedidos_activos;
    });

    if(localStorage.getItem('tipo_local')){
      this.tipo_local = localStorage.getItem('tipo_local');
    }
    console.log(this.tipo_local);
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

  prepararPedido(tipo_producto:string){
    console.log(tipo_producto)

    this.db.collection('locales').doc(`${this.nombre}`).collection('catalogo').valueChanges().subscribe(data=>{
      console.log(data)

      var inputOptions = {};
      data.forEach(producto=>{
        if(producto.tipo_producto === tipo_producto){
          console.log(producto);
          inputOptions[`${producto.nombre_producto}`] = `${producto.nombre_producto}`
        }
      });
      this.mostrarAlert(inputOptions, tipo_producto);
    });

  }

  mostrarAlert(inputOptions:any, tipo_producto:any){

    Swal.mixin({
      input: 'select',
      inputValidator: function (value) {
        return new Promise(function (resolve, reject) {
          if (value !== '') {
            if(isNumber(value)){
              console.log('Es un numero');
              console.log(value)
            }else{
              console.log('Es un string')
              console.log(value)
            }
            resolve();
          } else {
            resolve('Debes seleccionar una opción');
          }
        });
      },
      confirmButtonText: 'Siguiente &rarr;',
      progressSteps: ['1','2','3','4'],
      allowOutsideClick: false,
      showCancelButton: true,
      cancelButtonText: 'Salir',
      cancelButtonColor: 'red',
      customClass: {
        content: 'container-class'
      }
    }).queue([
      {
        title: 'Seleccione el tipo de entrega',
        text: 'su respuesta influirá en la entrega final del pedido',
        inputPlaceholder : 'Selecciona una opción',
        inputOptions: {
          'reparto' : 'Reparto',
          'retiro' : 'Retiro en local'
      }
    },
     {
        title: 'Seleccione el producto',
        text: 'su respuesta influirá en la entrega final del pedido',
        inputPlaceholder : 'Selecciona una opción',
        input: 'select',
        inputOptions: inputOptions
    },
    {
      title: '¿Cuantos de este producto?',
      text: 'su respuesta influirá en la entrega final del pedido',
      inputPlaceholder : 'Cantidad',
      input: 'number',
    }
    ]).then((result) => {
      if (result.value) {
        console.log('tipo local: ' + result.value);
        this.db.collection('locales').doc(`${this.nombre}`).collection('catalogo').valueChanges().subscribe((data:any)=>{
          data.forEach(producto =>{
            if(producto.tipo_producto === tipo_producto){
              if(producto.nombre_producto === result.value[1]){
                this.openDialog(result.value[0], result.value[1], tipo_producto , result.value[2], producto.precio_producto);
              }
            }
          })
        });
      }
    });
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

  openDialog(tipo_entrega:string, nombre_producto:string, tipo_producto:string, cantidad:number, precio_producto:number){
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog2, {
      width: '700px',
      height: '600px',
      data: {tipo_entrega: tipo_entrega, nombre_producto: nombre_producto, tipo_producto: tipo_producto, cantidad: cantidad, precio_producto:precio_producto},
      disableClose: true
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

  constructor(public auth:AuthService, public verDireccion:VerDireccionClienteService ,public route:Router, private _bottomSheetRef: MatBottomSheetRef<BottomSheetOverviewExampleSheet>, 
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


@Component({
  selector: 'dialog-overview-example-dialog-2',
  templateUrl: 'dialog-overview-example-dialog-2.html',
  styleUrls: ['./pedidos.component.css']
})
export class DialogOverviewExampleDialog2 {
  nombre;
  dataSource_ingredientes:any;
  seleccion_ingredientes:any = [];
  selected:string;
  ver_ingredientes:boolean = false;
  pedidos_nuevos:any = new Array();
  monto_total:any;
  inputOptions:any = {};
  pedidos:any = [];
  @ViewChild('select_ingrediente') select :MatSelect;
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog2>,
    @Inject(MAT_DIALOG_DATA) public data: any, public afDb : AngularFirestore, public agregarNuevoProductoService:AgregarNuevoProductoService) {
      console.warn(data)
      this.nombre = localStorage.getItem('nombre')
      this.afDb.collection('locales').doc(`${this.nombre}`).collection('ingredientes').valueChanges().subscribe((data)=>{
        this.dataSource_ingredientes = data;
      });
      
      this.pedidos.push({
        ingredientes: this.seleccion_ingredientes,
        tipo_entrega: this.data.tipo_entrega,
        cantidad: this.data.cantidad,
        nombre_producto: this.data.nombre_producto,
        precio_producto: this.data.precio_producto,
        tipo_producto: this.data.tipo_producto
      });

      this.afDb.collection('locales').doc(`${this.nombre}`).collection('carrito').get().subscribe((data=>{
        data.forEach(element =>{
          console.log(element.data());
          this.pedidos.push({
            ingredientes: element.data().ingredientes,
            tipo_entrega: element.data().tipo_entrega,
            cantidad: element.data().cantidad,
            nombre_producto: element.data().nombre_producto,
            precio_producto: element.data().precio_producto,
            tipo_producto: element.data().tipo_producto
          });
        })
      }));

      this.monto_total = data.precio_producto * data.cantidad;

      this.afDb.collection('locales').doc(`${this.nombre}`).collection('catalogo').valueChanges().subscribe(datos=>{
        console.log(datos)
        datos.forEach(producto=>{
            this.inputOptions[`${producto.tipo_producto}`] = `${producto.tipo_producto}`;      
        });
       
      });
    }

  onNoClick(){
    console.log(this.data.precio_producto)
    console.log(this.seleccion_ingredientes)
    Swal.fire({
      title: 'Atención',
      text: '¿Está seguro de crear este producto?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText : 'Aceptar',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: 'red',
      allowOutsideClick: false,
      type: 'info'
    }).then((result)=>{
      console.log(result)
        if(result.value){

          this.afDb.collection('locales').doc(`${this.nombre}`).collection('catalogo').add({
            ingredientes: this.seleccion_ingredientes,
            nombre_producto: this.data.nombre_producto,
            precio_producto: this.data.precio_producto,
            tipo_producto: this.data.tipo_producto
          }).then(()=>{
            console.log('Creado con exito!');
            this.dialogRef.close();
          })

        }else{
          return false
        }
    })
  }

  agregarNuevoProducto(){
    Swal.fire({
      title: 'Atención',
      type: 'info',
      text: 'Para que pueda agregar otro producto, su pedido actual será guardado',
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: 'red'
    }).then((result)=>{
      console.log(result)

      if(result.value){
        this.afDb.collection('locales').doc(`${this.nombre}`).collection('carrito').add({
          ingredientes : this.seleccion_ingredientes,
          nombre_producto : this.data.nombre_producto,
          precio_producto: this.data.precio_producto,
          tipo_entrega: this.data.tipo_entrega,
          tipo_producto: this.data.tipo_producto,
          cantidad: this.data.cantidad
        }).then((docRef)=>{
            this.afDb.collection('locales').doc(`${this.nombre}`).collection('carrito').doc(`${docRef.id}`).update({
              id_pedido: docRef.id
            }).then(()=>{
              console.log('actualizado con exito!');
              Swal.mixin({
                input: 'select',
                inputValidator: function (value) {
                  return new Promise(function (resolve, reject) {
                    if (value !== '') {
                      resolve();
                    } else {
                      resolve('Debes seleccionar una opción');
                    }
                  });
                },
                confirmButtonText: 'Continuar &rarr;',
                allowOutsideClick: false,
                showCancelButton: true,
                cancelButtonText: 'Salir',
                cancelButtonColor: 'red',
              }).queue([
                {
                  title: 'Seleccione el tipo de producto',
                  text: 'su respuesta influirá en la entrega final del pedido',
                  inputPlaceholder : 'Selecciona una opción',
                  input: 'select',
                  inputOptions: this.inputOptions
              },
              ]).then((result)=>{
                if(result.value){
                  console.log(result.value[0]);
                  this.dialogRef.close();
                  this.agregarNuevoProductoService.emitChange({
                    abrir_nuevo_producto: true,
                    tipo_producto: result.value[0]
                  });
                }else{
      
                }
              })
            })
        })
        console.log(this.pedidos_nuevos)
      }else{

      }
    })

  }

  agregarIngrediente(){
    console.log(this.seleccion_ingredientes.includes({nombre_ingrediente: this.selected}))
    if(!this.seleccion_ingredientes.includes({nombre_ingrediente: this.selected})){
      if( typeof this.selected === "undefined"){
        console.log('Es undefined')
        Swal.fire({
          title: 'Atención',
          type: 'info',
          text: `Debe seleccionar una opción`,
          position: 'top',
          showConfirmButton: true
        })
      }else{
        if(this.seleccion_ingredientes.length >= 3){
          console.log('mayor a o igual a 3');
          Swal.fire({
            title: 'Atención',
            type: 'info',
            text: `No puedes agregar mas ingredientes`,
            position: 'top',
            showConfirmButton: true
          })
        }else{
          console.log('menor a 3');
          console.log(this.selected)
          if(this.selected === ''){
            console.log('VACIO');
            Swal.fire({
              title: 'Atención',
              text: 'Seleccione una opción',
              type: 'warning',
              showConfirmButton: true,
              confirmButtonText: 'Ok',
              allowOutsideClick: false
            });

          }else{
            this.afDb.collection('locales').doc(`${this.nombre}`).collection('ingredientes').doc(`${this.selected}`).valueChanges().subscribe((data:any)=>{
              console.log(data)
              this.seleccion_ingredientes.push({
                nombre_ingrediente: this.selected,
                precio_ingrediente: data.precio,
                stock: data.stock
              });
              this.select.value = '';
              this.selected = "";
              console.log(this.seleccion_ingredientes)
            }, (err)=>{
              console.log(JSON.stringify(err))
            });
          }
        }
      }
    }else{
      console.log('si esta')
      Swal.fire({
        title: 'Atención',
        text: `${this.selected} ya se encuentra seleccionado`,
        position: 'top',
        showConfirmButton: true
      })
    }
  }

  salirModal(){
    Swal.fire({
      title: 'Atención',
      text: '¿Está seguro que desea salir?, perderá todos los datos ingresados',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText : 'Aceptar',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: 'red',
      allowOutsideClick: false,
      type: 'info'
    }).then((result)=>{
      if(result.value){
        this.dialogRef.close();
      }else{
        return false
      }
    })
  }

  verIngredientes(){
    if(!this.ver_ingredientes){
      this.ver_ingredientes = true;
    }else{
      this.ver_ingredientes = false;
    }
  }

}
