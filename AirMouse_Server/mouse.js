var robot = require("robotjs");
robot.setMouseDelay(0);
robot.setKeyboardDelay(0);

const maxScreenDimension = Math.max(robot.getScreenSize().width, robot.getScreenSize().height);

const linearAccelerationFactor = 1.075;
const quadraticAccelerationFactor = 0.25;

var movePreferenceFactor = 0.7;
var moveSensitivity = maxScreenDimension / 120 * movePreferenceFactor;

const scrollSweetSpot = 200;
var scrollPreferenceFactor = 0.6;
var scrollSensitivity = scrollSweetSpot * scrollPreferenceFactor;

var oldScrollX, oldScrollY;
const scrollIntervalTimeout = 7;
var scrollXInterval = null, scrollYInterval = null;
var scrollPortionX = 40, scrollPortionY = 40;

var oldPinchScale = 1;
var pinchSensitivity = 0.4;

function MoveToCenter()
{
    let centerX = robot.getScreenSize().width / 2;
    let centerY = robot.getScreenSize().height / 2;
    
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

function MouseToggle(toggleType)
{
    robot.mouseToggle(toggleType);
}

function MouseScroll(scrollX, scrollY)
{
    scrollX *= scrollSensitivity;
    scrollY *= scrollSensitivity;
    
    let maxAbsScroll = Math.max(Math.abs(scrollX), Math.abs(scrollY));

    if (maxAbsScroll == Math.abs(scrollX))
    {
        oldScrollX = Math.round(scrollX) / scrollPortionX * scrollSweetSpot;
        robot.scrollMouse(Math.round(scrollX), 0);
    }
    else
    {
        oldScrollY = Math.round(scrollY) / scrollPortionY * scrollSweetSpot;
        robot.scrollMouse(0, Math.round(scrollY));
    }
}

function Zoom(zoomType)
{
    robot.keyToggle("control", "down");
        switch(zoomType)
        {
            case "in":
            {
                robot.keyTap("+");    
                break;
            }
            case "out":
            {
                robot.keyTap("-");
                break;
            }
            default: break;
        }

    setTimeout(() =>
    {
        robot.keyToggle("control", "up");
    }, 1);
}

function MousePinch(scale)
{
    let scaleDifference = Math.abs(scale - oldPinchScale);
    let pinchScaleStep = 0.25 * (1 - pinchSensitivity / 2);    

    if(scaleDifference > pinchScaleStep)
    {
        if(scale < oldPinchScale) Zoom("out");
        else Zoom("in");

        oldPinchScale = scale;
    }
}

function UpdateMouse(gyro, nrOfReceivedData)
{
    let linearXSpeed = linearAccelerationFactor * gyro.gyroZ;
    let linearYSpeed = linearAccelerationFactor * gyro.gyroX;

    let quadraticXSpeed = quadraticAccelerationFactor * Math.sign(gyro.gyroZ) * Math.pow(gyro.gyroZ, 2);
    let quadraticYSpeed = quadraticAccelerationFactor * Math.sign(gyro.gyroX) * Math.pow(gyro.gyroX, 2);

    let newXSpeed = linearXSpeed + quadraticXSpeed;
    let newYSpeed = linearYSpeed + quadraticYSpeed;

    let newX = robot.getMousePos().x - newXSpeed * moveSensitivity; 
    let newY = robot.getMousePos().y - newYSpeed * moveSensitivity;

    MoveCursor(Math.round(newX), Math.round(newY));
}

module.exports = 
{
    UpdateMouse: UpdateMouse,
    MoveToCenter: MoveToCenter,

    MouseClick: MouseClick,
    MouseToggle: MouseToggle,

    MouseScroll: MouseScroll,
    
    MousePinch: MousePinch,
    oldPinchScale: oldPinchScale
};
