import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { DatePipe } from '@angular/common';
import { ResolutionService } from '../services/resolution.service';

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
  selector: 'app-roomlist',
  templateUrl: './roomlist.component.html',
  styleUrls: ['./roomlist.component.css']
})
export class RoomlistComponent implements OnInit {

  nickname = '';
  displayedColumns: string[] = ['roomname'];
  rooms = [];
  isLoadingResults = true;
  add = false;
  room = false;
  roomname = '';
  device = 'pc';
  isAdmin = false;
  addMem = false;
  i;

  constructor(private route: ActivatedRoute,
    private router: Router,
    public datepipe: DatePipe,
    private deviceCheck: ResolutionService) {

    if (deviceCheck.getIsMobileResolution()) {
      this.device = 'mobile';
    }

    this.nickname = localStorage.getItem('nickname');
    firebase.database().ref('rooms/').on('value', resp => {
      this.rooms = [];
      resp.forEach(i => {
        if (i.val().members.includes(this.nickname)) {
          let arr: { key: string }
          arr = i.val();
          arr.key = i.key;
          this.rooms.push(arr);
        }
      });
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    // for(let i in this.rooms){
    //   this.rooms[i]
    //   firebase.database().ref('chats/').orderByChild('roomname').equalTo(this.roomname).once('value', resp => {
    //     let chats = [];
    //     chats = snapshotToArray(resp);
    //     for(let i in chats){
    //       let obj = chats[i].roomname === this.rooms[i];
    //       console.log(chats[i])
  
    //     }
    //   })
    // }
  }

  selectChangeHandler(event: any, roomname: any, admin: any) {
    console.log(event, roomname)
    if (event !== admin) {
      firebase.database().ref('rooms/').orderByChild('roomname').equalTo(roomname).once('value', (resp: any) => {
        let roomuser = [];
        roomuser = snapshotToArray(resp);
        if (roomuser !== undefined) {
          const userRef = firebase.database().ref('rooms/' + roomuser[0].key + '/members');
          userRef.orderByValue().equalTo(event).once('value', (snapshot) => {
            userRef.child(Object.keys(snapshot.val())[0]).remove();
          });
        }
      })
    }

  }

  closeModal(event) {
    this.room = false;
  }
  closeAddModal(event) {
    this.add = false;
  }

  enterChatRoom(roomname: string) {
    this.roomname = roomname;
    let admin = this.getAdmin(roomname);
    if (admin == this.nickname) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
    // const chat = { roomname: '', nickname: '', message: '', date: '', type: '' };
    // chat.roomname = roomname;
    // chat.nickname = this.nickname;
    // chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    // chat.message = `${this.nickname} enter the room`;
    // chat.type = 'join';
    // const newMessage = firebase.database().ref('chats/').push();
    // newMessage.set(chat);

    firebase.database().ref('chats/').orderByChild('roomname').equalTo(this.roomname).limitToLast(100).once('value', (resp: any) => {
      let roomuser = [];
      let nick = this.nickname;
      roomuser = snapshotToArray(resp);
      roomuser.forEach(function (child) {
        // console.log(nick)
        if (child.nickname !== nick) {
          const userRef = firebase.database().ref('chats/' + child.key);
          userRef.update({ status: 'read' });
        }

      })
    });

    firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(roomname).once('value', (resp: any) => {
      let roomuser = [];
      roomuser = snapshotToArray(resp);
      const user = roomuser.find(x => x.nickname === this.nickname);
      if (user !== undefined) {
        const userRef = firebase.database().ref('roomusers/' + user.key);
        userRef.update({ status: 'online' });
      } else {
        const newroomuser = { roomname: '', nickname: '', status: '' };
        newroomuser.roomname = roomname;
        newroomuser.nickname = this.nickname;
        newroomuser.status = 'online';
        const newRoomUser = firebase.database().ref('roomusers/').push();
        newRoomUser.set(newroomuser);
      }
    });
    this.room = true;

  }

  logout(): void {
    localStorage.removeItem('nickname');
    this.router.navigate(['/login']);
  }

  addRoom() {
    this.add = true;
  }

  getAdmin(roomname: string) {
    let roomuser = [];
    firebase.database().ref('rooms/').orderByChild('roomname').equalTo(roomname).once('value', (resp: any) => {
      roomuser = snapshotToArray(resp);
    })
    return (roomuser[0].admin);
  }


  addMember(roomname: string, member: any) {
    event.stopPropagation();
    firebase.database().ref('rooms/').orderByChild('roomname').equalTo(roomname).once('value', (resp: any) => {
      let roomuser = [];
      roomuser = snapshotToArray(resp);
      const userRef = firebase.database().ref('rooms/' + roomuser[0].key + '/members');
      userRef.orderByValue().equalTo(member.value.newMember).once('value', (snapshot: any) => {
        if (snapshot.exists()) {
          var x = document.getElementById("snackbar");
          // Add the "show" class to DIV
          x.className = "show";
          // After 3 seconds, remove the show class from DIV
          setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
        } else {
          const len = roomuser[0].members.length;
          userRef.child(len).set(member.value.newMember);
        }
      });

    })
  }

  abc() { event.stopPropagation(); }

  more(x) {
    event.stopPropagation();
    this.addMem = true;
    this.i = x;
  }

  closeModa() {
    this.addMem = false;

  }

  deactivate(rommandisAdmin) {
    event.stopPropagation();
    if (rommandisAdmin[1]) {
      firebase.database().ref('rooms/').orderByChild('roomname').equalTo(rommandisAdmin[0]).once('value', (resp: any) => {
        let roomuser = [];
        roomuser = snapshotToArray(resp);
        if (roomuser !== undefined) {
          const userRef = firebase.database().ref('rooms/' + roomuser[0].key);
          userRef.remove();
        }
      })
    } else {
      firebase.database().ref('rooms/').orderByChild('roomname').equalTo(rommandisAdmin[0]).once('value', (resp: any) => {
        let roomuser = [];
        roomuser = snapshotToArray(resp);
        if (roomuser !== undefined) {
          const userRef = firebase.database().ref('rooms/' + roomuser[0].key + '/members');
          userRef.orderByValue().equalTo(this.nickname).once('value', (snapshot) => {
            userRef.child(Object.keys(snapshot.val())[0]).remove();
          });
        }
      })
    }

  }

}
