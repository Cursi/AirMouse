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

  epsilonGyroVelocity: number = 0.0115;
  
  scroll =
  {
    scrollX: null,
    scrollY: null
  };

  mouseCanvas: any;
  mc: any;

  doubleClickDelay: number = 200;
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
            this.socket.emit('mouseSingleTap');
            break;
          }
          case 2: 
          {
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
  
      this.socket.emit('mouseScroll', this.scroll); 
    }
  }

  PanEnd()
  {
    if(this.mousePressedDown)
    {
      this.PressUp();
    }
  }

  RightTap()
  {
    this.socket.emit('mouseRightTap');
  }

  PressDown(event)
  {
    this.mousePressedDown = true;
    if(event != null) this.DrawCircleTap(event.center.x, event.center.y, false);    

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

    this.socket.emit('mousePressUp');
  }

  Pinch(event)
  {
    if(!this.mousePressedDown)
    {
      this.DrawCircleTap(event.srcEvent.clientX, event.srcEvent.clientY, true);    
      this.socket.emit('mousePinch', event.scale);
    }
  }

  PinchEnd()
  {
    this.socket.emit('mousePinchEnd');    
  }
  
  SendGyroData()
  {
    try
    {
      this.gyroscope.watch(this.gyroOptions).subscribe((orientation: GyroscopeOrientation) =>
      {
        if(Math.abs(orientation.z) > this.epsilonGyroVelocity && Math.abs(orientation.x) > this.epsilonGyroVelocity)
        {
          this.gyro.gyroX = orientation.x;
          this.gyro.gyroZ = orientation.z;
    
          this.socket.emit ('gyroChanged', this.gyro);
        }
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

    // this.gyroAvailable = true;
    
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
      this.mc.on("pinchend", () => this.PinchEnd());      
    }
    else
    {
      document.getElementById("mouseLeftButton").remove();
      document.getElementById("mouseRightButton").remove();

      this.mouseCanvas.innerHTML = 
        "<span id='containerCatch'>" +
          "<span id='appNameCatch'>AirMouse</span>" +  
          " is not available for your device. :(" +
        "</span>";
    }
  }
}