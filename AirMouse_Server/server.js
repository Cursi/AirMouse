const app = require('express')();
const http = require('http');
const socketIo = require('socket.io');
const utils = require("./utils");

app.get('/', function(req, res)
{
  res.send('<h1>Hello world</h1>');
});

const IP = utils.GetLocalExternalIP();
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

  socket.on("disconnect", () =>
  {
    document.getElementById("stateContainer").innerHTML = "disconnected";
  });

  socket.on('gyroChanged', (gyro) => 
  {
    nrOfReceivedData++;
    mouse.UpdateMouse(gyro, nrOfReceivedData);
  });

  socket.on('mouseSingleTap', () =>
  {
    mouse.MouseClick("left", false);
  });

  socket.on('mouseDoubleTap', () =>
  {
    mouse.MouseClick("left", true);
  });

  socket.on('mouseRightTap', () =>
  {
    mouse.MouseClick("right", false);    
  });

  socket.on('mouseScroll', (scroll) =>
  {
    mouse.MouseScroll(scroll.scrollX, scroll.scrollY);
  });

  socket.on('mousePressDown', () =>
  {
    mouse.MouseToggle("down");
  });

  socket.on('mousePressUp', () =>
  {
    mouse.MouseToggle("up");    
  });

  socket.on('mousePinch', (scale) =>
  {
    mouse.MousePinch(scale);    
  });

  socket.on('mousePinchEnd', (scale) =>
  {
    mouse.oldPinchScale = 1;
  });
});
