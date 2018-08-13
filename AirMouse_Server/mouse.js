var robot = require("robotjs");

class Direction 
{
	constructor()
	{
		this.alpha = 0;	
		this.delta = 0;	
	}
}

// You must modify it according to your framerate
var framerate = 30;

var heading, height;
var aux, c_mar, c_mic;
var angle;
var calc_x, calc_y;
var cx, cy;

var x0 = robot.getScreenSize().width / 2, y0 = robot.getScreenSize().height / 2;

var x_sens = 1200.0, y_sens = 1200.0;
var pi = 3.141592654;

//The reducer values need to be carefully calibrated, I'm not sure this is the right value
var gyro_x_reducer = pi, gyro_y_reducer = pi, gyro_z_reducer = pi;

//Direction is the new class I defined, it just has two double fields for angles
var screen, down;
var screen_x, screen_y, screen_z, down_x, down_y, down_z;

function MoveCursor(x, y)
{
	robot.moveMouse(x, y);
}

//Call at the beginning of the connection
function Calibrate_to_screen_center()
{
	screen.alpha = 0;
	screen.delta = 0;
	down.alpha = 0;
	down.delta = (-1.0) * pi / 2;

	MoveCursor(x0, y0);
}

//Needed to eliminate some calculation errors 
function Correct(val)
{
	if (isNaN(val)) return 0;
	if (val > 1.0) return 1.0;
	if (val < (-1.0)) return (-1.0);
	return val;
}

function ReduceAngles()
{
	while (screen.alpha < 0) screen.alpha += 2 * pi;
	while (screen.alpha > 2 * pi) screen.alpha -= 2 * pi;
	while (down.alpha < 0) down.alpha += 2 * pi;
	while (down.alpha > 2 * pi) down.alpha -= 2 * pi;
}

function Apply_x_rot(vector, angle)
{
	var result = new Direction();

	var epsilon = Math.acos(Correct(Math.cos(vector.delta) * Math.sin(vector.alpha)));
	var theta = Math.asin(Correct(Math.cos(vector.alpha) * Math.cos(vector.delta) / Math.sin(epsilon)));

	if (vector.delta < 0)
		theta = pi - theta;
	
	theta += angle;
	
	result.delta = Math.asin(Correct(Math.sin(epsilon) * Math.cos(theta)));
	result.alpha = Math.acos(Correct(Math.sin(theta) * Math.sin(epsilon) / Math.cos(result.delta)));
	if (epsilon > pi / 2)
		result.alpha = result.alpha * (-1.0);
	
	result.delta = result.delta - vector.delta;
	result.alpha = result.alpha - vector.alpha;           

	return result;
}

function Apply_y_rot(vector, angle)
{	
	var result = new Direction();

	var epsilon = Math.acos(Correct(Math.cos(vector.delta) * Math.cos(vector.alpha)));
	var theta = Math.asin(Correct(Math.sin(vector.alpha) * Math.cos(vector.delta) / Math.sin(epsilon)));
	
	if (vector.delta < 0)
		theta = pi - theta;
	
	theta -= angle;
	
	result.delta = Math.asin(Correct(Math.sin(epsilon) * Math.cos(theta)));
	result.alpha = Math.asin(Correct(Math.sin(epsilon) * Math.sin(theta) / Math.cos(result.delta)));

	if (epsilon > pi / 2)
		result.alpha = pi - result.alpha;
	
	result.delta = result.delta - vector.delta;
	result.alpha = result.alpha - vector.alpha;

	return result;
}

function Apply_z_rot(vector, angle)
{
	var result = new Direction();

	result.alpha = angle;
	result.delta = 0;

	return result;
}

function UpdateMouse(sensors, nrOfReceivedData)
{
	try
	{
		screen = new Direction();
		down = new Direction();	
		
		try
		{
			//Neglected first 19 measurements because the console showed some deserialization errors
			if (nrOfReceivedData == 20)
			{
				Calibrate_to_screen_center();				
			}

			if (nrOfReceivedData > 20)
			{
				//X rot
				angle = sensors.gyroX / (framerate * gyro_x_reducer);
				screen_x = Apply_x_rot(screen, angle);
				down_x = Apply_x_rot(down, angle);
				//Y rot
				angle = sensors.gyroY / (framerate * gyro_y_reducer);
				screen_y = Apply_y_rot(screen, angle);
				down_y = Apply_y_rot(down, angle);
				//Z rot
				angle = sensors.gyroZ / (framerate * gyro_z_reducer);
				screen_z = Apply_z_rot(screen, angle);
				down_z = Apply_z_rot(down, angle);

				screen.alpha = screen.alpha + screen_x.alpha + screen_y.alpha + screen_z.alpha;
				screen.delta = screen.delta + screen_x.delta + screen_y.delta + screen_z.delta;

				down.alpha = down.alpha + down_x.alpha + down_y.alpha + down_z.alpha;
				down.delta = down.delta + down_x.delta + down_y.delta + down_z.delta;
			}

			// Selected fewer measurements in order to reduce lag
			if (nrOfReceivedData % 10 == 0)
			{
				ReduceAngles();
				console.log(screen);
				console.log(down);

				height = Math.asin(Correct(Math.cos(down.delta) * Math.cos(down.alpha)));
				aux = Math.acos(Correct(Math.cos(screen.delta) * Math.cos(screen.alpha)));

				heading = Math.acos(Correct(Math.cos(aux) / Math.cos(height)));
				
				//Trigonometric caution
				c_mar = Math.asin(Correct(Math.sin(down.alpha) * Math.cos(down.delta) / Math.cos(height)));
				c_mic = Math.asin(Correct(Math.sin(screen.alpha) * Math.cos(screen.delta) / Math.sin(aux)));
				if (down.delta < 0)
					c_mar = pi - c_mar;
				if (screen.delta < 0)
					c_mic = pi - c_mic;
				
				if (Math.sin(c_mar - c_mic) > 0)
					heading = heading * (-1.0);
				//end of trig caution
				
				calc_y = y_sens * Math.sin(height);
				calc_x = x_sens * Math.cos(height) * Math.sin(heading);
				cx = Math.floor(calc_x) + x0;
				cy = Math.floor(calc_y) + y0;

				// console.log(cx, cy);				
				MoveCursor(cx, cy);
			}
		}
		// Calc error
		catch(err)
		{
			document.getElementById("errorContainer").innerHTML = err;			
		}
	}
	// RobotJS error
	catch(err)
	{
		document.getElementById("errorContainer").innerHTML = err;
	}
}

module.exports = 
{
	UpdateMouse: UpdateMouse
};