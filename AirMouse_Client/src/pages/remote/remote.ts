import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope';
import * as io from 'socket.io-client';

// import { Hammer } from "ionic-angular/gestures/hammer";
// import {Gesture} from 'ionic-angular/gestures/gesture'

@IonicPage()
@Component({
  selector: 'page-remote',
  templateUrl: 'remote.html',
  providers: [ Gyroscope ]
})
export class RemotePage
{
  constructor(public navCtrl: NavController, public navParams: NavParams, private gyroscope: Gyroscope) 
  {

  }

  gyroAvailable: boolean = true;
  socket: SocketIOClient.Socket = this.navParams.get("socket");

  gyroOptions: GyroscopeOptions =
  {
    frequency: 16
  };

  gyro =
  {
    gyroX: null,
    gyroY: null,
    gyroZ: null
  };

  
  scroll =
  {
    scrollX: null,
    scrollY: null
  };

  mouseCanvas: any;
  mc: any;

  doubleClickDelay: number = 170;
  numberOfTaps: number = 0;
  doubleClickTimer: any = null;

  SingleTapTrivial()
  {
    console.log("mouseSingleTap");
    this.socket.emit('mouseSingleTap');
  }

  // SingleTap()
  // {
  //   this.numberOfTaps++;

  //   if(this.doubleClickTimer == null)
  //   {
  //     this.doubleClickTimer = setTimeout(() =>
  //     {
  //       switch(this.numberOfTaps)
  //       {
  //         case 1: 
  //         {
  //           console.log("mouseSingleTap");
  //           this.socket.emit('mouseSingleTap');
  //           break;
  //         }
  //         case 2: 
  //         {
  //           console.log("mousedoubleTap");
  //           this.socket.emit('mouseDoubleTap');
  //           break;
  //         }
  //         default: break;
  //       }

  //       this.numberOfTaps = 0;
  //       this.doubleClickTimer = null;
  //     }, this.doubleClickDelay);
  //   }
  // }
  
  Pan(event)
  {
    this.scroll.scrollX = event.velocityX;
    this.scroll.scrollY = event.velocityY;

    console.log("mouseScroll: ", this.scroll);
    this.socket.emit('mouseScroll', this.scroll);    
  }

  Press()
  {
    console.log("mouseRightTap");
    this.socket.emit('mouseRightTap');
  }

  SendGyroData()
  {
    try
    {
      this.gyroscope.watch(this.gyroOptions).subscribe((orientation: GyroscopeOrientation) =>
      {
        this.gyro.gyroX = orientation.x;
        this.gyro.gyroY = orientation.y;
        this.gyro.gyroZ = orientation.z;
  
        this.socket.emit ('gyroChanged', this.gyro);
      });
    }
    catch(error)
    {
      this.gyroAvailable = false;
    }
  }

  ionViewDidLoad() 
  {
    this.mouseCanvas = document.getElementById("canvas");
    this.SendGyroData();
    
    if(this.gyroAvailable)
    {
      this.mc = new Hammer(this.mouseCanvas);
      // this.mc.add(
      // [ 
      //   new Hammer.Tap(), 
      //   new Hammer.Pan(), 
      //   new Hammer.Press() 
      // ]);

      this.mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

      this.mc.on("tap", () => this.SingleTapTrivial());
      this.mc.on("pan", (event) => this.Pan(event));
      this.mc.on("press", () => this.Press());
    }
    else
    {
      this.mouseCanvas.innerHTML = 
        "<span id='containerCatch'>" +
          "<span id='appNameCatch'>AirMouse</span>" +  
          " is not available for your device. :(" +
        "</span>";
    }
  } 
}