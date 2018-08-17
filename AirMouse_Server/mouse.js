var robot = require("robotjs");
robot.setMouseDelay(0);
robot.setKeyboardDelay(0);

const maxScreenDimension = Math.max(robot.getScreenSize().width, robot.getScreenSize().height);

const movePreferenceFactor = 0.94;
const moveSensitivity = maxScreenDimension / 100 * movePreferenceFactor;

const scrollPreferenceFactor = 0.4;
const scrollSensitivity = maxScreenDimension / 10 * scrollPreferenceFactor;

var oldPinchScale = 1;
const pinchScaleStep = 0.15;

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

    if (maxAbsScroll == Math.abs(scrollX)) robot.scrollMouse(Math.round(scrollX), 0);
    else robot.scrollMouse(0, Math.round(scrollY));
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
    }, 10);
}

function MousePinch(scale)
{
    console.log("oldScale: " + oldPinchScale);
    console.log("scale: " + scale);

    let scaleDifference = Math.abs(scale - oldPinchScale);

    if(scaleDifference > pinchScaleStep)
    {
        if(scale < oldPinchScale) Zoom("out");
        else Zoom("in");

        oldPinchScale = scale;
    }
}

function UpdateMouse(gyro, nrOfReceivedData)
{
    let currentX = robot.getMousePos().x;
    let currentY = robot.getMousePos().y;

    var newX = currentX - gyro.gyroZ * moveSensitivity; 
    var newY = currentY - gyro.gyroX * moveSensitivity;

    MoveCursor(Math.round(newX), Math.round(newY));
}

module.exports = 
{
    UpdateMouse: UpdateMouse,
    MoveToCenter: MoveToCenter,
    MouseClick: MouseClick,
    MouseScroll: MouseScroll,
    MouseToggle: MouseToggle,
    MousePinch: MousePinch,
    oldPinchScale: oldPinchScale
};
