import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-crear-ruta',
  templateUrl: './crear-ruta.component.html',
  styleUrls: ['./crear-ruta.component.css']
})
export class CrearRutaComponent implements OnInit {
  lat: number = 51.678418;
  lng: number = 7.809007;

  constructor( public auth:AuthService) { 


  }

  ngOnInit() {
  }

}
