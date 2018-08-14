var robot = require("robotjs");
robot.setMouseDelay(0);
var bresenham = require('bresenham/generator');

// This will be setable by user
const preferenceFactor = 0.72;

const maxScreenDimension = Math.max(robot.getScreenSize().width, robot.getScreenSize().height);
const sensitivity = maxScreenDimension / 100 * preferenceFactor;

// const epsilon = 0.0165;

// function Bresenham(x0, y0, x1, y1)
// {
//     var line = bresenham(x0, y0, x1, y1);
//     var point = line.next().value;

//     while(point = line.next().value)
//     {
//         console.log(point);
//         // MoveCursor(point);
//     }
// }

function MoveToCenter()
{
    var centerX = robot.getScreenSize().width / 2;
    var centerY = robot.getScreenSize().height / 2;
    
    MoveCursor(centerX, centerY);
}

function MoveCursor(cursorX, cursorY)
{
	robot.moveMouse(cursorX, cursorY);
}

// function MouseClick(clickType, isDouble)
// {
//     robot.mouseClick(clickType, isDouble);
// }

// function MouseScroll(scrollX, scrollY)
// {
//     robot.scrollMouse(scrollX, scrollY);
// }

function UpdateMouse(sensors, nrOfReceivedData)
{
    // if(Math.abs(sensors.gyroZ) > epsilon && Math.abs(sensors.gyroX) > epsilon)
    // {
        var currentX = robot.getMousePos().x;
        var currentY = robot.getMousePos().y;

        var newX = currentX - sensors.gyroZ * sensitivity; 
        var newY = currentY - sensors.gyroX * sensitivity; 

        // console.log(Math.round(currentX), Math.round(currentY), Math.round(newX), Math.round(newY));
        // Bresenham(Math.round(currentX), Math.round(currentY), Math.round(newX), Math.round(newY));
        
        MoveCursor(Math.round(newX), Math.round(newY));
    // }
}

module.exports = 
{
    UpdateMouse: UpdateMouse,
    MoveToCenter: MoveToCenter
};
