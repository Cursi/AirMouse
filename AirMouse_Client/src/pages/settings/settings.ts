import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage 
{
  constructor(public navCtrl: NavController, public navParams: NavParams){ }

  settings = this.navParams.get('settings');
  socket: SocketIOClient.Socket = this.navParams.get("socket");

  ionViewDidLoad()
  {
    console.log(this.settings);
    console.log(this.socket);
  }

  ionViewWillLeave()
  {
    console.log("Update local storage and send to server");
  }

}
