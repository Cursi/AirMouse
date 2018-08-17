var robot = require("robotjs");
robot.setMouseDelay(0);
robot.setKeyboardDelay(0);

const maxScreenDimension = Math.max(robot.getScreenSize().width, robot.getScreenSize().height);

const movePreferenceFactor = 0.94;
const moveSensitivity = maxScreenDimension / 100 * movePreferenceFactor;

const scrollPreferenceFactor = 0.5;
const scrollSensitivity = maxScreenDimension / 10 * scrollPreferenceFactor;

const epsilonGyroVelocity = 0.0115;

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

setTimeout(() =>
{
    robot.keyToggle("control", "down");

    for(var index = 0; index < 10; index++)
    {
        robot.keyTap("+");    
    }

    setTimeout(() =>
    {
        robot.keyToggle("control", "up");
    }, 10);
}, 1000);

function Zoom(zoomType, numberOfTimes)
{
    robot.keyToggle("control", "down");

    for(var index = 0; index < numberOfTimes; index++)
    {
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
    }

    setTimeout(() =>
    {
        robot.keyToggle("control", "up");
    }, 10);
}

function MousePinch(scale)
{
    
}

function UpdateMouse(gyro, nrOfReceivedData)
{
    if(Math.abs(gyro.gyroZ) > epsilonGyroVelocity && Math.abs(gyro.gyroX) > epsilonGyroVelocity)
    {
        let currentX = robot.getMousePos().x;
        let currentY = robot.getMousePos().y;

        var newX = currentX - gyro.gyroZ * moveSensitivity; 
        var newY = currentY - gyro.gyroX * moveSensitivity;

        MoveCursor(Math.round(newX), Math.round(newY));
    }
}

module.exports = 
{
    UpdateMouse: UpdateMouse,
    MoveToCenter: MoveToCenter,
    MouseClick: MouseClick,
    MouseScroll: MouseScroll,
    MouseToggle: MouseToggle,
    MousePinch: MousePinch
};
