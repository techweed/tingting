import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as firebase from 'firebase/app';
import 'firebase/database'; // If using Firebase database
import 'firebase/auth'; // If using Firebase database

import { snapshotToArray } from '../chatroom/chatroom.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  nickname = '';
  matcher = new MyErrorStateMatcher();

  constructor(private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    if (localStorage.getItem('nickname')) {
      this.router.navigate(['/home']);
    }
    this.loginForm = this.formBuilder.group({
      'nickname': [null, Validators.required],
      'password': [null, Validators.required]
    });
  }

  signup() {
    this.router.navigate(['/signup']);
  }

  onFormSubmit(form: any) {
    let x = document.getElementById("snackbar");
    let user = [];
    const login = form;
    login.nickname = login.nickname.toLowerCase();
    firebase.database().ref('clients/').orderByChild('nickname').equalTo(login.nickname).once('value', snapshot => {
      if (snapshot.exists()) {
        user = snapshotToArray(snapshot);
        if (user[0].password == login.password) {
          localStorage.setItem('nickname', login.nickname);
          this.router.navigate(['/home']);
          //firebase auth..
          firebase.auth().signInAnonymously().catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
          });
        } else {
          x.className = "show";
          x.innerText = "Incorrect Password"
          setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);

        }

      } else {
        x.className = "show";
        x.innerText = "User not found"
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
      }
    });
  }


}
