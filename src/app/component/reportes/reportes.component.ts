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

  title = 'Browser market shares at a specific website, 2014';
  type:string = 'PieChart';

  data = [
    ['Firefox', 45.0],
    ['IE', 26.8],
    ['Chrome', 12.8],
    ['Safari', 8.5],
    ['Opera', 6.2],
    ['Others', 0.7] 
  ];
  columnNames = ['Browser', 'Percentage'];
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
      this.columnNames = ['Browser', 'Percentage', 'Another'];
      this.data = [
        ['Firefox', 45.0, 22],
        ['IE', 26.8, 12],
        ['Chrome', 12.8, 10],
        ['Safari', 8.5, 8],
        ['Opera', 6.2, 20],
        ['Others', 1.7, 15] 
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
