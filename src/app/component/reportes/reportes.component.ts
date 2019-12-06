import { Component, OnInit } from '@angular/core';
import {faChartPie, faGlobeAmericas, faFilePdf} from '@fortawesome/free-solid-svg-icons';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  faChartPie = faChartPie;
  faGlobeAmericas = faGlobeAmericas;
  faFilePdf = faFilePdf;
  lat: number = 51.678418;
  lng: number = 7.809007;
  map:any;

  title = 'Aqui podras visualizar cuantas ventas tienen tus productos';
  type:string = 'PieChart';

  data = [
    ['italiano', 45],
    ['aleman', 26],
    ['tradicional', 12], 
  ];
  columnNames = ['Producto', 'Porcentaje'];
  options = {
    colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'], 
    is3D: true
  };
  width = 550;
  height = 400;
  nombre:string;
  constructor(public afdb:AngularFirestore) {
      this.nombre = localStorage.getItem('nombre');
      this.afdb.collection('locales').doc(`${this.nombre}`).get().subscribe(data=>{
        console.log(data.data());
        var datos_empresa = data.data();
        this.lat = datos_empresa.lat;
        this.lng = datos_empresa.lng;
      });
   }

  ngOnInit() {
  }

  circuloClick(evento:any){
    console.log(evento)
  }

  cambiarGrafico(evento:any){
    console.log(evento)
    if(evento.value == 'BubbleChart'){
      this.columnNames = ['Producto', 'Porcentaje', 'Otro'];
      this.data = [
        ['italiano', 45, 2],
        ['aleman', 26, 12],
        ['tradicional', 12, 18], 
      ];
      this.width = 600;
      this.height = 501;
      this.options
    }else if(evento.value == 'PieChart'){

    }
  }

  mapReady(map){
    this.map = map;
    console.log(this.map);
  }

}
