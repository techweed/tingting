import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import 'firebase/auth'; // If using Firebase database

@Injectable()
export class AuthService {
    constructor(private router: Router) { }

    // authenticateUser(username: string, password: string): Observable<any[]> {
    //    // call API to authenticate user
    //    // set the token in localstorage
    //    localStorage.setItem('access_token', "jwt_token");
    // }



    logout() {
        localStorage.removeItem('nickname');
        var user = firebase.auth().currentUser;
        if(user.isAnonymous){
            user.delete().then(function() {
              // User deleted. Redirect to login page...
            }).catch(function(error) {
              // An error happened.
            });
        this.router.navigate(['/login']);
        }
    }

    isAuthenticated() {
        // get the auth token from localStorage
        let token = localStorage.getItem('nickname');
        if (token) {
            return true;
        }
        return false;

    }


}
