import { Component, OnInit, Inject, Input, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as firebase from 'firebase/app';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-addroom',
  templateUrl: './addroom.component.html',
  styleUrls: ['./addroom.component.css']
})
export class AddroomComponent implements OnInit {

  roomForm: FormGroup;
  roomname = '';
  ref = firebase.database().ref('rooms/');
  matcher = new MyErrorStateMatcher();
  @Output() closeModal = new EventEmitter<boolean>();

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.roomForm = this.formBuilder.group({
      'roomname': [null, Validators.required]
    });
  }


  toggleModal() {
    this.closeModal.emit(false);
  }

  onFormSubmit(form: any) {
    form.admin = localStorage.getItem('nickname');
    form.members = [form.admin];
    const room = form;
    this.ref.orderByChild('roomname').equalTo(room.roomname).once('value', (snapshot: any) => {
      if (snapshot.exists()) {
        var x = document.getElementById("snackbar");
        // Add the "show" class to DIV
        x.className = "show";
        // After 3 seconds, remove the show class from DIV
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
      } else {
        const newRoom = firebase.database().ref('rooms/').push();
        newRoom.set(room);
        // this.router.navigate(['/roomlist']);
        this.toggleModal();
      }
    });
  }

}
