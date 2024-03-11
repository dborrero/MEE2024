// TimedSlew.js
// Modern Eddington Experiment 2024
// by Daniel Borrero
// Last update: 2024-03-11


/* This script points the telescope to a calibration field shifted east in right ascension by RAoffset from a 
target at (RA,Dec) = (TargRA,TargDec), then to the target, and finally to a calibration field shifted west by
RAoffset in right ascension from the target. The slews are initiated at specific times set by t1 and t2. It 
can easily be generalized for any desired pattern of pointings and offsets desired at a solar eclipse by adding 
additional trigger times and slew blocks. The target coordinate coordinate is taken from TheSkyX's internal 
database. This program only moves the mount, IT DOES NOT TAKE IMAGES.
*/


////////////////////////////////////////////////////////////////////////////////////////
///////////////// SETUP BASIC OBJECTS //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// Create basic objects to control mount and set up sky model
var Mount = sky6RASCOMTele;      // Create mount object that will take slew commands
var StarChart = sky6StarChart;   // Create skychart object that will be used for calculations of object positions, times, etc.
var Out="";   // Create variable to store output strings
var err; // Create variable to store error codes


/////////////////////////////////////////////////////////////////////
///////////// SETUP AUXILIARY FUNCTIONS ///////////////////
////////////////////////////////////////////////////////////////////

function logOutput(logText){
// Auxiliary function to write messages to the JavaScript output window and to a text log file
	
	RunJavaScriptOutput.writeLine(logText);
	TextFile.write(logText);
	
	}

function TimeStampString(){
// Auxiliary function to write current system time as a string

	StarChart.DocumentProperty(9);
	sky6Utils.ConvertJulianDateToCalender(StarChart.DocPropOut);
	return String(sky6Utils.dOut0) + "-" + String(sky6Utils.dOut1) + "-" + String(sky6Utils.dOut2) + " " + String(sky6Utils.dOut3) + ":" + String(sky6Utils.dOut4) + ":" + String(sky6Utils.dOut5);
	
	}

logOutput("Timed slew running.");
logOutput("");
logOutput("WARNING: This script DOES NOT acquire images.");
logOutput("Image acquisition needs to be done with a different program running in parallel.");
logOutput("")

/////////////////////////////////////////////////////////////////////
/////// CHECK CONNECTION TO MOUNT //////////////////////
////////////////////////////////////////////////////////////////////

logOutput("Connecting to mount...");
try {
	Mount.Connect();
	Mount.Asynchronous = 0;
	}
catch(e) {
	throw new Error("No connection to the mount!");
	}
logOutput("Mount is connected.")
logOutput("");

//////////////////////////////////////////////////////////////////////////////////////////
/////// SET TARGET AND SLEW TRIGGER TIMES //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

// Set target and offset
var TargName = "Sun";  // Set target. Named targets like "Sun", "Jupiter", "Vega" should all work. 
var RAoffset = 10;           // Set RA offset in degrees
RAoffset = RAoffset/15;  // Set RA offset in hours

// Try finding target in TheSkyX database
StarChart.Find(TargName);
err = StarChart.LASTCOMERROR;
StarChart.LASTCOMERROR = 0;

logOutput("Searching for target in TheSkyX database..."); 

if (err != 0) {
// If target not found, display error message

	Out = TargName + " not found."

	}
else {
// If target is found, find current RA and Dec

	sky6ObjectInformation.Property(54); // Look up RA for target in database
	TargRA = sky6ObjectInformation.ObjInfoPropOut;

	sky6ObjectInformation.Property(55); // Look up Dec for target in database
	TargDec = sky6ObjectInformation.ObjInfoPropOut;
	
	Out = "Target found at " + String(TargRA) + " | "+ String(TargDec);

	}

logOutput(Out);
logOutput("");

// Set trigger times for slews
sky6Utils.ConvertCalenderToJulianDate(2024,3,11,12,39,0) // Input time to start first slew in (YYYY, MM, DD, HH, MM, SS) *local* system time
t1 = sky6Utils.dOut0   // Save time for first slew to t1 as Julian date
sky6Utils.ConvertCalenderToJulianDate(2024,3,11,12,39,30) // Input time to start second slew in (YYYY, MM, DD, HH, MM, SS) *local* system time
t2 = sky6Utils.dOut0 // Save time for second slew to t2 as Julian date


//////////////////////////////////////////////////////////////////////////////
//////////// RUN SLEW PATTERN W/ TIMED TRIGGERS ///////////////
/////////////////////////////////////////////////////////////////////////////

function TimedSlew(){ 
// This function slews the mount to three locations. It starts pointing east
// of target, points to target at t1, and west of target at t2	

	// Slew to east calibration field
	Out = TimeStampString(); 
	logOutput("Starting slew to " + String(TargRA+RAoffset) + " | "+ String(TargDec) + " at " + Out);
	Mount.SlewToRaDec(TargRA+RAoffset, TargDec, TargName+"East");
	Out = TimeStampString(); 
	logOutput("Slew complete at " + Out);
	logOutput("");

	// Check time until it hits t1
	while (StarChart.DocPropOut < t1) {
		StarChart.DocumentProperty(9); // Pull current time from chart model (i.e., current *local* system time) in Julian time
		}
	
	// Slew to target field
	Out = TimeStampString(); 
	logOutput("Starting slew to " + String(TargRA) + " | "+ String(TargDec) + " at " + Out);
	Mount.SlewToRaDec(TargRA, TargDec,TargName);
	Out = TimeStampString(); 
	logOutput("Slew complete at " + Out);
	logOutput("");

	// Check time until it hits t2
	while (StarChart.DocPropOut < t2) {
		StarChart.DocumentProperty(9);
		}

	// Slew to west calibration field
	sky6Utils.ConvertJulianDateToCalender(StarChart.DocPropOut);
	Out = TimeStampString(); 
	logOutput("Starting slew to " + String(TargRA-RAoffset) + " | "+ String(TargDec) + " at " + Out);
	Mount.SlewToRaDec(TargRA-RAoffset, TargDec,TargName+"West");
	Out = TimeStampString(); 
	logOutput("Slew complete at " + Out);
	logOutput("");	

	// Print completion message
	logOutput("Timed slew complete.");

	}

TimedSlew(); // Run timed slew function



