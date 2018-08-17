const app = require('express')();
const http = require('http');
const ip = require("ip");
const socketIo = require('socket.io');

app.get('/', function(req, res)
{
  res.send('<h1>Hello world</h1>');
});

const IP = ip.address();
const PORT = 1234;

const server = http.Server(app);
server.listen(PORT, IP);

var nrOfReceivedData = 0;
var mouse = require('./mouse.js');

const io = socketIo(server);

io.on('connection', (socket) =>
{ 
  socket.emit("connected",
  {
    greeting: "Hi, bro!"
  });

  document.getElementById("stateContainer").innerHTML = "connected";
  mouse.MoveToCenter();
  console.log(socket.id + " connected.");

  socket.on("disconnect", () =>
  {
    document.getElementById("stateContainer").innerHTML = "disconnected";
    console.info(socket.id + " disconnected.");
  });

  socket.on('gyroChanged', (gyro) => 
  {
    nrOfReceivedData++;
    mouse.UpdateMouse(gyro, nrOfReceivedData);
  });

  socket.on('mouseSingleTap', () =>
  {
    console.log("singleTap");
    mouse.MouseClick("left", false);
  });

  socket.on('mouseDoubleTap', () =>
  {
    console.log("doubleTap");
    mouse.MouseClick("left", true);
  });

  socket.on('mouseRightTap', () =>
  {
    console.log("rightTap");
    mouse.MouseClick("right", false);    
  });

  socket.on('mouseScroll', (scroll) =>
  {
    console.log("mouseScroll");
    mouse.MouseScroll(scroll.scrollX, scroll.scrollY);
  });

  socket.on('mousePressDown', () =>
  {
    console.log("mouseDown");
    mouse.MouseToggle("down");
  });

  socket.on('mousePressUp', () =>
  {
    console.log("mouseUp");
    mouse.MouseToggle("up");    
  });

  socket.on('mousePinch', (scale) =>
  {
    console.log("mousePinch");
    mouse.MousePinch(scale);    
  });

  socket.on('mousePinchEnd', (scale) =>
  {
    console.log("mousePinchEnd");
    mouse.oldPinchScale = 1;
  });
});
