** 3PointTimedSlew.js**
---
This script can be used to slew a telescope between a calibration field east of an astronomical target, a field centered at the target, and a calibration field west of the target at user determined times (relative to the local system clock) using TheSkyX. Download and save this file to a known location.

To run it, connect your mount to TheSkyX (Go to `Telescope >> Telescope Setup >> Mount >> Mount Setup >> Choose...` and choose your mount, then go to `Telescope >> Telescope Setup >> Mount >> Mount Setup >> Connect`. For a simulated mount, select `Software Bisque >> Telescope Mount Simulator` (*not* `Telescope Mount Simulator 3`)).

Then go to `Tools >> Run  JavaScript`, open the download JavaScript file and scroll to the section labeled `SET TARGET AND SLEW TRIGGER TIMES` to set the target and slew trigger times. The code will find named targets like the Sun, planets, and major stars in the TheSkyX's internal database. Once you have set the target and trigger times, hit `Save` and then hit `Run` and the code should start running. You can also set up right ascension offset of the calibration fields.

After checking the connection to the mount and searching for the target in the TheSkyX's database, the mount will immediately slew to the east calibration field. At time `t1`, it will slew over to the target and then at time `t2` it will slew to the west calibration field. At this point the script will stop leaving the mount pointed at the west calibration field.

Note that while script currently correctly outputs to the console in TheSkyX, it does not currently output a proper log file, even though it seems like it should.
