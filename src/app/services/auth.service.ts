import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription, Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( public afDB: AngularFirestore) { }

verificarUsuario(nombre:string, contraseña:string){
  
    nombre = nombre.toLocaleLowerCase();
    contraseña = contraseña.toLocaleLowerCase();
    console.log("desde el servicio");
/*     this.afDB.collection('locales').doc(`${nombre}`).valueChanges().subscribe((data:any)=>{
        if(data){
          let passwordBD:string;
          passwordBD = data.password;
          if(contraseña === passwordBD){
            
          }else{
            console.log("no existe");
            return false;
          }

        }else{
          console.log("no hay informacion");
        }
    }); */
    
    return new Promise((resolve, reject)=>{
      //AUTH ANTIGUO
        /* this.afDB.collection(`${nombre}`).doc('web').collection(`${contraseña}`)
                            .valueChanges().subscribe((data)=>{
                              if(data.length != 0){
                                console.log(data);
                                resolve(true)
                              }else{
                                resolve(false)
                              }
                            }); */

          this.afDB.collection('locales').doc(`${nombre}`).valueChanges().subscribe((data:any)=>{
              if(data.length != 0){
                let passwordBD:string;
                passwordBD = data.password;
                if(contraseña === passwordBD){
                  resolve(true);
                }else{
                  console.log("no existe");
                  resolve(false);
                }
              }else{
                console.log("no hay informacion");
              }
            });
    });
  }

  getConductores(nombre:string): Observable<any>{
    let subject = new Subject<any>(); 
    this.afDB.collection('locales').doc(`${nombre}`).collection('movil').valueChanges().subscribe((data:any)=>{
      if(data.length != 0){
        subject.next(data);
      }else{
        console.log("no hay informacion");
      }
    });
    
    return subject.asObservable();
  }

  getConductor(nombre:string, clave:string): Observable<any>{
    let subject = new Subject<any>(); 
    this.afDB.collection('locales').doc(`${nombre}`).collection('movil').doc(`${clave}`).valueChanges().subscribe((data:any)=>{
      if(data.length != 0){
        subject.next(data);
      }else{
        console.log("no hay informacion");
      }
    });
    
    return subject.asObservable();
  }

  getPedidos(nombre:string): Observable<any>{
    let subject = new Subject<any>(); 
    this.afDB.collection('locales').doc(`${nombre}`).collection('pedidos').valueChanges().subscribe((data:any)=>{
      if(data.length != 0){
        subject.next(data);
      }else{
        console.log("no hay informacion");
      }
    });
    
    return subject.asObservable();
  }
    
}
