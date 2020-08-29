import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
// import { RoomlistComponent } from './roomlist/roomlist.component';
// import { AddroomComponent } from './addroom/addroom.component';
// import { ChatroomComponent } from './chatroom/chatroom.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './services/auth.guard';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  // { path: 'roomlist', component: RoomlistComponent },
  // { path: 'addroom', component: AddroomComponent },
  // { path: 'chatroom/:roomname', component: ChatroomComponent },
  { path: 'home',  canActivate: [AuthGuard], component: HomeComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full'}
];

// const mobile_routes: Routes = [
//   {path: '**', redirectTo: ''}
// ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  // public constructor(private router: Router,
  //   private applicationStateService: ApplicationStateService) {

  //   if (applicationStateService.getIsMobileResolution()) {
  //     router.resetConfig(mobile_routes);
  //   }
  // }
 }