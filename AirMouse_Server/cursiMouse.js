var robot = require("robotjs");
robot.setMouseDelay(0);

const rate = 200.0;

function MoveCursor(x, y)
{
	robot.moveMouse(x, y);
}

function UpdateMouse(sensors, nrOfReceivedData)
{
    console.log(Math.floor(sensors.accX * rate) + ", " + Math.floor(sensors.accY * rate));
    MoveCursor(Math.floor(sensors.accX * rate), Math.floor(sensors.accY * rate) );
}

module.exports = 
{
	UpdateMouse: UpdateMouse
};
