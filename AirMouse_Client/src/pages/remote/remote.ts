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

  doubleClickDelay: number = 125;
  numberOfTaps: number = 0;
  doubleClickTimer: any = null;

  mousePressedDown: boolean = false;

  DrawCircleTap(clientX, clientY, isScrollCircle)
  {
    if(clientX != null && clientY != null)
    {
      var tapCircle = document.createElement("span");
      tapCircle.classList.add("tapCircle");
  
      if(isScrollCircle)
      {
        tapCircle.style.width = "25px";
        tapCircle.style.height = "25px";
      }
      else
      {
        tapCircle.style.width = "50px";
        tapCircle.style.height = "50px";
      }

      tapCircle.style.left = clientX - 25 + "px";
      tapCircle.style.top = clientY - 25 + "px";
      
      if(this.mousePressedDown)
      {
        tapCircle.classList.add("fixedCircle");
        tapCircle.id = "mousePressedCircle";
      }
      else
      {
        setTimeout(() => 
        {
          document.body.removeChild(tapCircle);
        }, 300);
      }

      document.body.appendChild(tapCircle);
    }
  }

  SingleTap(event)
  {
    this.numberOfTaps++;

    if(this.doubleClickTimer == null)
    {
      this.doubleClickTimer = setTimeout(() =>
      {
        this.DrawCircleTap(event.clientX, event.clientY, false);
        
        switch(this.numberOfTaps)
        {
          case 1: 
          {
            // console.log("mouseSingleTap");
            this.socket.emit('mouseSingleTap');
            break;
          }
          case 2: 
          {
            // console.log("mousedoubleTap");
            this.socket.emit('mouseDoubleTap');
            break;
          }
          default: break;
        }

        this.numberOfTaps = 0;
        this.doubleClickTimer = null;
      }, this.doubleClickDelay);
    }
  }
  
  Pan(event)
  {
    if(!this.mousePressedDown)
    {
      this.DrawCircleTap(event.center.x, event.center.y, true);
  
      this.scroll.scrollX = event.velocityX;
      this.scroll.scrollY = event.velocityY;
  
      // console.log("mouseScroll");
      this.socket.emit('mouseScroll', this.scroll); 
    }
  }

  PanEnd()
  {
    if(this.mousePressedDown)
    {
      // console.log("pan end");
      this.PressUp();
    }
  }

  RightTap()
  {
    // console.log("mouseRightTap");
    this.socket.emit('mouseRightTap');
  }

  PressDown(event)
  {
    this.mousePressedDown = true;
    if(event != null) this.DrawCircleTap(event.center.x, event.center.y, false);    

    // console.log("mousePressDown");
    this.socket.emit('mousePressDown');
  }

  PressUp()
  {
    this.mousePressedDown = false; 
    var mousePressedCircle = document.getElementById("mousePressedCircle");
    try
    {
      document.body.removeChild(mousePressedCircle);
    }
    catch(error) { }

    // console.log("mousePressUp");
    this.socket.emit('mousePressUp');
  }

  Pinch(event)
  {
    if(!this.mousePressedDown)
    {
      this.DrawCircleTap(event.srcEvent.clientX, event.srcEvent.clientY, true);    
  
      // console.log("mousePinch");
      this.socket.emit('mousePinch');
    }
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

    this.gyroAvailable = true;
    
    if(this.gyroAvailable)
    {
      this.mc = new Hammer(this.mouseCanvas);
      this.mc.add(new Hammer.Pinch());
      this.mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

      this.mc.on("tap", () => this.SingleTap(event));
      this.mc.on("pan", (event) => this.Pan(event));
      this.mc.on("panend", () => this.PanEnd());
      this.mc.on("press", (event) => this.PressDown(event));
      this.mc.on("pressup", () => this.PressUp());
      this.mc.on("pinch", (event) => this.Pinch(event));
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