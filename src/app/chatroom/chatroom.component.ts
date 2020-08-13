import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as firebase from 'firebase/app';
import { DatePipe } from '@angular/common';
import { ResolutionService } from '../services/resolution.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export const snapshotToArray = (snapshot: any) => {
  const returnArr = [];

  snapshot.forEach((childSnapshot: any) => {
    const item = childSnapshot.val();
    item.key = childSnapshot.key;
    returnArr.push(item);
  });

  return returnArr;
};

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit {

  @ViewChild('chatcontent') chatcontent: ElementRef;
  scrolltop: number = null;
  chatForm: FormGroup;
  nickname = '';
  message = '';
  users = [];
  chats = [];
  device = 'pc';
  
  matcher = new MyErrorStateMatcher();
  @Input() roomname: string;
  @Input() isAdmin: boolean;
  @Output() closeModal = new EventEmitter<boolean>();
  @Output() deactivate = new EventEmitter<[string,boolean]>();

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe,
    private deviceCheck: ResolutionService) {

    if (deviceCheck.getIsMobileResolution()) {
      this.device = 'mobile';
    }
  }
  ngOnInit(): void {
    this.nickname = localStorage.getItem('nickname');
    firebase.database().ref('chats/').orderByChild('roomname').equalTo(this.roomname).on('value', resp => {
      this.chats = [];
      this.chats = snapshotToArray(resp);
      setTimeout(() => this.scrolltop = this.chatcontent.nativeElement.scrollHeight, 500);
    });
    // firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(this.roomname).once('value', (resp2: any) => {
    //   const roomusers = snapshotToArray(resp2);
    //   this.users = roomusers.filter(x => x.status === 'online');
    // });
    this.chatForm = this.formBuilder.group({
      'message': [null, Validators.required]
    });
  }

  ngOnDestroy() {
    this.exitChat();
  }

  onFormSubmit(form: any) {
    const chat = form;
    chat.roomname = this.roomname;
    chat.nickname = this.nickname;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.type = 'message';
    chat.status = 'send'
    const newMessage = firebase.database().ref('chats/').push();
    newMessage.set(chat);
    this.chatForm = this.formBuilder.group({
      'message': [null, Validators.required]
    });
  }

  toggleModal() {
    this.closeModal.emit(false);
  } 
   deactivat(x) {
    this.deactivate.emit([x,this.isAdmin]);
    this.toggleModal();
  }

  exitChat() {
    //   const chat = { roomname: '', nickname: '', message: '', date: '', type: '' };
    //   chat.roomname = this.roomname;
    //   chat.nickname = this.nickname;
    //   chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    //   chat.message = `${this.nickname} leave the room`;
    //   chat.type = 'exit';
    //   const newMessage = firebase.database().ref('chats/').push();
    //   newMessage.set(chat);

    firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(this.roomname).once('value', (resp: any) => {
      let roomuser = [];
      roomuser = snapshotToArray(resp);
      const user = roomuser.find(x => x.nickname === this.nickname);
      if (user !== undefined) {
        const userRef = firebase.database().ref('roomusers/' + user.key);
        userRef.update({ status: 'offline' });
      }
    });
  }

}
