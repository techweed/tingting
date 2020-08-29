import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  ref = firebase.database().ref('users/');

  constructor(private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      'nickname': [null, Validators.required],
      'password': [null, Validators.required],
      'confirm_password': [null, Validators.required]
    });
  }

  onFormSubmit(form: any) {
    if (form.nickname && form.password && form.confirm_password && form.password == form.confirm_password) {
      const signup = {
        nickname: '',
        password: ''
      };
      signup.nickname = form.nickname.toLowerCase();
      signup.password = form.password;
      this.ref.orderByChild('nickname').equalTo(signup.nickname).once('value', snapshot => {
        if (snapshot.exists()) {
          var x = document.getElementById("snackbar");
          x.className = "show";
          setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
        } else {
          const newUser = firebase.database().ref('users/').push();
          newUser.set(signup);
          this.router.navigate(['/login']);
        }
      });
    } else{

    }
  }

}
