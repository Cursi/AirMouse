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
// var mouse = require('./cursiMouse.js');
var mouse = require('./mouse.js');

const io = socketIo(server);

io.on('connection', (socket) =>
{
  socket.emit("connected",
  {
    greeting: "Hi, bro!"
  });

  document.getElementById("stateContainer").innerHTML = "connected";
  console.log(socket.id + " connected.");

  socket.on("disconnect", () =>
  {
    document.getElementById("stateContainer").innerHTML = "disconnected";
    console.info(socket.id + " disconnected.");
  });

  socket.on('sensorsChanged', (sensors) => 
  {
    nrOfReceivedData++;
    mouse.UpdateMouse(sensors, nrOfReceivedData);
  });
});
