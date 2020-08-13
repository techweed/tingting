import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

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
        this.router.navigate(['/login']);

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
