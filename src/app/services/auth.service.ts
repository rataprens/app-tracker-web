import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( public afDB: AngularFirestore) { }

  verificarUsuario(nombre:string, contraseña:string){
    nombre = nombre.toLocaleLowerCase();
    contraseña = contraseña.toLocaleLowerCase();
    console.log("desde el servicio");
    
    return new Promise((resolve, reject)=>{
        this.afDB.collection(`${nombre}`).doc('web').collection(`${contraseña}`)
                            .valueChanges().subscribe((data)=>{
                              if(data.length != 0){
                                console.log(data);
                                resolve(true)
                              }else{
                                resolve(false)
                              }
                            });
    });
  }
}
