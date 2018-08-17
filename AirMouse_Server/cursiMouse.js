var robot = require("robotjs");
robot.setMouseDelay(0);

var bresenham = require('bresenham/generator');
const bresenhamTimeout = 1;
const bresenhamPreferenceFactor = 10.4;
const frequency = 16;

const maxScreenDimension = Math.max(robot.getScreenSize().width, robot.getScreenSize().height);

const movePreferenceFactor = 0.94;
const moveSensitivity = maxScreenDimension / 100 * movePreferenceFactor;
const bresenhamSensitivity = maxScreenDimension / 100 * bresenhamPreferenceFactor;

const scrollPreferenceFactor = 0.5;
const scrollSensitivity = maxScreenDimension / 10 * scrollPreferenceFactor;

// const epsilon = 0.0165;

function Bresenham(x0, y0, x1, y1)
{
    var lineX = bresenham(x0, y0, x1, y1);
    var pointX = lineX.next().value;

    var lineY = bresenham(x0, y0, x1, y1);
    var pointY = lineY.next().value;

    var deltaX = Math.abs(x1 - x0) / frequency;
    var deltaY = Math.abs(y1 - y0) / frequency;

    for (var index = 0; index < Math.round(deltaX); index++)
    {
        pointX = lineX.next().value;
    }

    for (var index = 0; index < Math.round(deltaY); index++)
    {
        pointY = lineY.next().value;
    }

    for (var index = 0; index < frequency; index++)
    {
        setTimeout(() =>
        {
            MoveCursor(pointX.x, pointY.y);
        }, bresenhamTimeout);
    }
}

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

function MouseClick(clickType, isDouble)
{
    robot.mouseClick(clickType, isDouble);
}

function MouseScroll(scrollX, scrollY)
{
    scrollX *= scrollSensitivity;
    scrollY *= scrollSensitivity;

    let maxAbsScroll = Math.max(Math.abs(scrollX), Math.abs(scrollY));

    if (maxAbsScroll == Math.abs(scrollX)) robot.scrollMouse(Math.round(scrollX), 0);
    else robot.scrollMouse(0, Math.round(scrollY));
}
function UpdateMouse(gyro, nrOfReceivedData)
{
    // if(Math.abs(gyro.gyroZ) > epsilon && Math.abs(gyro.gyroX) > epsilon)
    {
        var currentX = robot.getMousePos().x;
        var currentY = robot.getMousePos().y;

        // var newX = currentX - gyro.gyroZ * moveSensitivity; 
        // var newY = currentY - gyro.gyroX * moveSensitivity; 
        // MoveCursor(Math.round(newX), Math.round(newY));

        var newX = currentX - gyro.gyroZ * bresenhamSensitivity; 
        var newY = currentY - gyro.gyroX * bresenhamSensitivity; 
        Bresenham(Math.round(currentX), Math.round(currentY), Math.round(newX), Math.round(newY));      
    }
}

module.exports = 
{
    UpdateMouse: UpdateMouse,
    MoveToCenter: MoveToCenter,
    MouseClick: MouseClick,
    MouseScroll: MouseScroll
};
