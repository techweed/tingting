import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import * as firebase from 'firebase';
import * as firebase from 'firebase/app';
import 'firebase/database'; // If using Firebase database
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
  i; //index of the room passed for more options in mobile


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
      let ind = -1;
      resp.forEach(i => {
        if (i.val().members &&Object.keys(i.val().members).includes(this.nickname)) {
          let arr: any;
          arr = i.val();
          arr.key = i.key;
          arr.unread = 0;
          this.rooms.push(arr);
          ind++;
        }
        if (this.rooms[ind]) {
          let ind2 = ind;
          firebase.database().ref('chats/' + i.val().roomname).limitToLast(100).once('value', resp2 => {
            let chats = [];
            chats = snapshotToArray(resp2);
            let y = 0;
            for (let i in chats) {
              if (chats[i].status === 'send' && chats[i].nickname != this.nickname) {
                y++;
                this.rooms[ind2].unread = y;
              }
            }
          })
        }
      });
      this.isLoadingResults = false;
    });


  }

  ngOnInit(): void {

  }

  selectChangeHandler(event: any, roomname: any, admin: any) {
    // console.log(event, roomname)
    if (event !== admin) {
      firebase.database().ref('rooms/').orderByChild('roomname').equalTo(roomname).once('value', (resp: any) => {
        let roomuser = [];
        roomuser = snapshotToArray(resp);
        if (roomuser !== undefined) {
          const userRef = firebase.database().ref('rooms/' + roomuser[0].key + '/members');
          // userRef.order().equalTo(event).once('value', (snapshot) => {
          //   console.log(snapshotToArray(snapshot))

          userRef.child(event).remove();
          // });
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
    const rr = this.rooms.find(x => x.roomname === roomname);
    rr.unread = 0;

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

    // firebase.database().ref('chats/' + this.roomname).on('value', resp => {
    //   this.chats = [];
    //   this.chats = snapshotToArray(resp);



    firebase.database().ref('chats/' + this.roomname).limitToLast(100).once('value', (resp: any) => {
      let roomuser = [];
      let nick = this.nickname;
      let rn = this.roomname;
      roomuser = snapshotToArray(resp);
      roomuser.forEach(function (child) {
        const userRef = firebase.database().ref('chats/' + rn + '/' + child.key);
        if (child.nickname !== nick) {
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
    let mem = member.value.newMember.toLowerCase();
    firebase.database().ref('users/').orderByChild('nickname').equalTo(mem).once('value', (snapshot: any) => {
      if (!snapshot.exists()) {
        var x = document.getElementById("snackbar");
        x.className = "show";
        x.innerText = "User not found"
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
      } else {
        firebase.database().ref('rooms/').orderByChild('roomname').equalTo(roomname).once('value', (resp: any) => {
          let roomuser = [];
          roomuser = snapshotToArray(resp);
          const userRef = firebase.database().ref('rooms/' + roomuser[0].key + '/members');
          userRef.orderByKey().equalTo(mem).once('value', (snapshot: any) => {
            if (snapshot.exists()) {
              var x = document.getElementById("snackbar");
              x.className = "show";
              x.innerText = "Already a Member"
              setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
            } else {
              userRef.child(mem).set(0);
            }
          })
        });
      }
    })
  }

  abc() { event.stopPropagation(); }

  more(x) {
    event.stopPropagation();
    this.addMem = true;
    this.i = x;
  }

  closeM() {
    this.addMem = false;

  }

  deactivate(rommandisAdmin) {
    event.stopPropagation();
    this.closeM();
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
          userRef.child(this.nickname).remove();
        }
      })
    }
  }

}
