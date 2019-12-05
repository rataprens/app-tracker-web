import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {faUser, faCarAlt, faTicketAlt, faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import { AngularFirestore } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import {MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSelect } from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';

/* export interface Ingrediente {
  nombre: string;
  stock: number;
  precio: number;
  
} */

@Component({
  selector: 'app-centro-control',
  templateUrl: './centro-control.component.html',
  styleUrls: ['./centro-control.component.css']
})
export class CentroControlComponent implements OnInit {
  faPencilAlt = faPencilAlt;
  faTicketAlt = faTicketAlt;
  faCarAlt = faCarAlt;
  faUser = faUser;

  columna_ingredientes: string[] = ['select','nombre', 'precio'];
  columna_catalogo: string[] = ['tipo_producto', 'nombre', 'ingredientes', 'precio'];
  columna_conductor: string[] = ['nombre', 'apellido', 'compartir', 'online'];
  columna_cliente:string[] = ['nombre', 'direccion', 'telefono'];

  dataSource_ingredientes:any;
  dataSource_catalogo:any;
  dataSource_conductores: any;
  dataSource_clientes: any;

  data_ingredientes:any = [];
  data_catalogo:any = [];
  data_conductores: any = [];
  data_clientes: any = [];
  
  nombre:string;
  inputOptions = {};

  animal: string;
  name: string;

  @ViewChild('paginator_ingredientes') paginator_ingredientes: MatPaginator;
  @ViewChild('paginator_catalogo') paginator_catalogo: MatPaginator;
  @ViewChild('paginator_conductor') paginator_conductor: MatPaginator;
  @ViewChild('paginator_cliente') paginator_cliente: MatPaginator;

  selection = new SelectionModel<any>(true, []);
  
  constructor(public afDb:AngularFirestore, public dialog: MatDialog) { 
    this.nombre = localStorage.getItem('nombre');
    var i = 1

    this.afDb.collection('locales').doc(`${this.nombre}`).collection('ingredientes').valueChanges().subscribe((data)=>{
      this.dataSource_ingredientes = new MatTableDataSource<any>(data);
      this.dataSource_ingredientes.paginator = this.paginator_ingredientes;
    });

    this.afDb.collection('locales').doc(`${this.nombre}`).collection('clientes').valueChanges().subscribe((data)=>{
      this.dataSource_clientes = new MatTableDataSource<any>(data);
      this.dataSource_clientes.paginator = this.paginator_cliente;
    });

    this.afDb.collection('locales').doc(`${this.nombre}`).collection('movil').valueChanges().subscribe(data=>{
      this.dataSource_conductores = new MatTableDataSource<any>(data);
      this.dataSource_conductores.paginator = this.paginator_conductor;
    })
    
    this.afDb.collection('locales').doc(`${this.nombre}`).collection('catalogo').valueChanges().subscribe((data)=>{
      this.dataSource_catalogo = new MatTableDataSource<any>(data);
      console.log(this.paginator_catalogo)
      this.dataSource_catalogo.paginator = this.paginator_catalogo;
      console.log(this.dataSource_catalogo.data);
    });
  }
    
  ngOnInit() {
    this.paginator_ingredientes._intl.itemsPerPageLabel = 'items por página';
  }
  
  isAllSelected_ingredientes() {
    const numSelected = this.selection.selected.length;
    const numRows = this.data_ingredientes.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle_ingredientes() {
    this.isAllSelected_ingredientes() ?
        this.selection.clear() :
        this.data_ingredientes.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel_ingredientes(row?: any): string {
    if (!row) {
      return `${this.isAllSelected_ingredientes() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  openDialog(tipo_producto:string, nombre_producto:string, precio:number){
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '450px',
      data: {tipo_producto: tipo_producto, nombre_producto: nombre_producto, precio_producto: precio},
      disableClose: true
    });
  }

  agregarProducto(){
    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Siguiente &rarr;',
      progressSteps: ['1', '2', '3'],
      showCancelButton: true,
      cancelButtonText: 'Atrás',
      cancelButtonColor: 'red',
      customClass: {
        content: 'container-class'
      }
    }).queue(
      [
        {
          title: 'Ingresa el nombre de tu nuevo producto',
          text: 'su respuesta influirá en la elavoración de los pedidos',
          allowOutsideClick: true,
          input: 'text',
          inputValidator: function (value) {
            return new Promise(function (resolve, reject) {
              if (value !== '') {
                var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                if(format.test(value)){
                  resolve('No se permiten caracteres especiales');
                }else{  
                  if(isNaN(parseInt(value))){
                    var regex = /\d+/g;
                    if(value.match(regex)){
                      console.log('hay numeros');
                      resolve('No se permiten numeros')
                    }else{
                      console.log('no hay numeros')
                      /* if(value.length){} */
                      console.log(value.length);
                      if(value.length > 30){
                        resolve('Solo se permite un maximo de 30 caracteres');
                      }else{
                        resolve()
                      }
                    }
                  }else{
                    resolve('No se permiten numeros')
                  }
                }
              } else {
                resolve('Debes ingresar un valor');
              }
            });
        }
        },
        {
          title: '¿Que tipo de producto es?',
          text: 'su respuesta influirá en la elavoración de los pedidos',
          allowOutsideClick: false,
          input: 'select',
          showCancelButton: false,
          inputOptions: {
            'sandwich': 'Sandwich',
            'completo': 'Completo',
            'pizza' : 'pizza'
          }
        },
        {
          title: '¿Cual es el precio?',
          text: 'su respuesta influirá en la elavoración de los pedidos',
          allowOutsideClick: false,
          showCancelButton: false,
          input: 'number',
          inputValidator: (value)=>{
            return new Promise((resolve, reject) =>{
              if(value !== ''){
                  var numero = parseInt(value);
                  if(numero < 0 ){
                    resolve('No puedes ingresar numeros negativos');
                  }else{
                    if(numero === 0){
                      resolve('Ingresa algún precio')
                    }else{
                      if(value.length > 6){
                        resolve('No se permiten mas 6 digitos')
                      }else{
                        resolve()
                      }
                    }
                  }
              }else{
                resolve('Debes ingresar un valor')
              }
            });
          }
        }
      ]
    ).then((result)=>{
      if(result.value){
        this.openDialog(result.value[1], result.value[0], Number(result.value[2]));
      }else{
        return false
      }
    })
  }

  agregarIngrediente(){
    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Siguiente &rarr;',
      progressSteps: ['1','2','3'],
      showCancelButton: true,
      cancelButtonText: 'Atrás',
      cancelButtonColor: 'red',
      customClass: {
        content: 'container-class'
      }
    }).queue(
      [
        {
          title: 'Ingresa el nombre de tu nuevo ingrediente',
          text: 'su respuesta influirá en la elavoración de los pedidos',
          allowOutsideClick: true,
          inputValidator: function (value) {
            return new Promise(function (resolve, reject) {
              if (value !== '') {
                var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                if(format.test(value)){
                  resolve('No se permiten caracteres especiales');
                }else{  
                  if(isNaN(parseInt(value))){
                    var regex = /\d+/g;
                    if(value.match(regex)){
                      console.log('hay numeros');
                      resolve('No se permiten numeros')
                    }else{
                      console.log('no hay numeros')
                      /* if(value.length){} */
                      console.log(value.length);
                      if(value.length > 30){
                        resolve('Solo se permite un maximo de 30 caracteres');
                      }else{
                        resolve()
                      }
                    }
                  }else{
                    resolve('No se permiten numeros')
                  }
                }
              } else {
                resolve('Debes ingresar un valor');
              }
            });
        }
        }
      ,
        {
          title: '¿Cual es el precio ($)?',
          text: 'su respuesta influirá en la elavoración de los pedidos',
          allowOutsideClick: false,
          input: 'number',
          showCancelButton: false,
          inputValidator: (value)=>{
            return new Promise((resolve, reject) =>{
              if(value !== ''){
                  var numero = parseInt(value);
                  if(numero < 0 ){
                    resolve('No puedes ingresar numeros negativos');
                  }else{
                    if(numero === 0){
                      resolve('Ingresa algún precio')
                    }else{
                      if(value.length > 4){
                        resolve('No se permiten mas 4 digitos')
                      }else{
                        resolve()
                      }
                    }
                  }
              }else{
                resolve('Debes ingresar un valor')
              }
            });
          }
        }
      ]
    ).then((result)=>{
      console.log(result.value)
      if(result.value){
        Swal.fire({
          title: 'Atención',
          text: 'Estas seguro de crear este ingrediente',
          showConfirmButton: true,
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Aceptar',
          cancelButtonColor: 'red',
          allowOutsideClick: false,
          type: 'question'
        }).then((respuesta)=>{
          console.log(respuesta)
          if(respuesta.value){

            this.afDb.collection('locales').doc(`${this.nombre}`).collection('ingredientes').doc(`${result.value[0]}`).set({
              nombre: result.value[0],
              precio: result.value[1],
            }).then(()=>{
              console.log('creado con exito');
              const toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
              });
              toast.fire({
                type: 'success',
                title: 'ingrediente creado con exito'
              })
            })
          }else{
            console.log('Cancelar');
            const toast = Swal.mixin({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              timer: 3000
            });
            toast.fire({
              type: 'error',
              title: 'No se creo el ingrediente'
            })
          }
        })  
      }else{
        return false
      }
    })
  }

}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
  styleUrls: ['./centro-control.component.css']
})
export class DialogOverviewExampleDialog {
  nombre;
  dataSource_ingredientes:any;
  seleccion_ingredientes:any = [];
  selected:string;
  @ViewChild('select_ingrediente') select :MatSelect;
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any, public afDb : AngularFirestore) {
      this.nombre = localStorage.getItem('nombre')
      this.afDb.collection('locales').doc(`${this.nombre}`).collection('ingredientes').valueChanges().subscribe((data)=>{
        this.dataSource_ingredientes = data;
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
      const toast = Swal.mixin({
        toast: true,
        timer: 3000,
        position: 'top',
        showConfirmButton: false
      });

      if(result.value){
        this.afDb.collection('locales').doc(`${this.nombre}`).collection('catalogo').add({
          ingredientes: this.seleccion_ingredientes,
          nombre_producto: this.data.nombre_producto,
          precio_producto: this.data.precio_producto,
          tipo_producto: this.data.tipo_producto
        }).then(()=>{
          console.log('Creado con exito!');
          this.dialogRef.close();
          toast.fire({
            type: 'success',
            title: 'Producto creado con exito'
          })
        });
      }else{
        toast.fire({
          type: 'warning',
          title: 'No se creo el producto'
        })
        
        return false
      }
    })
  }

  agregarIngrediente(){
    if(!this.seleccion_ingredientes.includes(this.selected)){
      if( typeof this.selected === "undefined"){
        console.log('Es undefined')
      }else{

        console.log('No esta');      
        this.seleccion_ingredientes.push(this.selected)
        this.select.value = ''
        console.log(this.seleccion_ingredientes)
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

}
