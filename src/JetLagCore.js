/**
 * Created by johnuiterwyk on 3/4/16.
 */
if (typeof JetLag == "undefined") {
    var JetLag = {};
};

// Current version.
JetLag.VERSION = '0.8';

JetLag.Core = function()
{
    this.example = {
        departureCity:      "Chicago, United States",
        departureTimezone:  "America/Chicago",
        departureDatetime:  "2016-05-08 16:30",
        arrivalCity:        "Paris, France",
        arrivalTimezone:    "Europe/Paris",
        arrivalDatetime:    "2016-05-09 08:00",
        sleepTime:          "00:30",
        wakeTime:           "08:00",
        planStart:          JetLag.Constants.PLAN_START_3_DAYS_ADVANCE,
        shiftSpeed:         JetLag.Constants.SHIFT_SPEED_GRADUAL
    };

};
JetLag.Core.prototype.getPlan = function(config)
{
    //create the holder for the plan.
    var plan = new JetLag.Plan(config);
    plan.departureTimezone = config.departureTimezone;
    plan.arrivalTimezone = config.arrivalTimezone;

    // first convert times to moment objects
    var validDateFormats = ["DD MMMM YYYY, HH:mm","YYYY-MM-DD HH:mm"];
    var departTime = moment.tz(config.departureDatetime,validDateFormats, config.departureTimezone);
    var arrivalTime = moment.tz(config.arrivalDatetime,validDateFormats, config.arrivalTimezone);

    //calculate duration of the flight, then add a flight event to the plan
    var flightDuration = moment.duration(arrivalTime.diff(departTime.clone().tz(config.arrivalTimezone)));
    plan.flightEvents.addEvent(JetLag.Constants.EVENT_TYPE_FLIGHT,departTime,flightDuration);

    // calculate when to start the plan
    var planStartTime;
    switch(config.planStart)
    {
        case JetLag.Constants.PLAN_START_3_DAYS_ADVANCE:
            planStartTime = departTime.clone().subtract(3,"days").startOf("day");
            break;
        case JetLag.Constants.PLAN_START_DEPARTURE:
            planStartTime = departTime.clone().startOf("day");
            break;
        case JetLag.Constants.PLAN_START_ARRIVAL:
            planStartTime = arrivalTime.clone().startOf("day");
            break;
    }


    var normalSleepTime, normalWakeTime, sleepDuration;
    normalSleepTime = moment.tz(config.sleepTime, ['h:m ', 'H:m'],config.departureTimezone);
    normalWakeTime = moment.tz(config.wakeTime, ['h:m ', 'H:m'],config.departureTimezone);
    if(normalWakeTime < normalSleepTime) {
        normalWakeTime.add('24', 'hours');
    }
    sleepDuration = moment.duration(normalWakeTime.diff(normalSleepTime));

    var sleepStart, mbtStart, mbtTarget, phaseDirection, mbtShift;
    // first lets figure out the sleep / wake time to start from
    sleepStart =  planStartTime.clone().subtract(1,"days");
    // sleep start will always be in home timezone
    sleepStart.tz(config.departureTimezone);
    // set the hour and minute using normal sleep time
    sleepStart.hours(normalSleepTime.hour());
    sleepStart.minutes(normalSleepTime.minute());

    //plan.sleepEvents.addEvent(JetLag.Constants.EVENT_TYPE_SLEEP,sleepStart,sleepDuration);


    if(sleepDuration < 8)
    {
        mbtStart = sleepStart.clone().add(sleepDuration).subtract(2,"hours");
    }else
    {
        mbtStart = sleepStart.clone().add(sleepDuration).subtract(3,"hours");
    }
    //plan.minBodyTempEvents.addEvent(JetLag.Constants.EVENT_TYPE_MBT,mbtStart,moment.duration(0));


    var timezoneDifference = this.getTimezoneDifference(config.departureTimezone, config.arrivalTimezone);
    if(timezoneDifference > -8 && timezoneDifference < 0)
    {

        phaseDirection = JetLag.Constants.PHASE_ADVANCE; //shift sleep earlier
        mbtShift = -1;
    }else
    {
        phaseDirection = JetLag.Constants.PHASE_DELAY; //shift sleep later
        mbtShift = 2;
    }

    var mbtDaysToShift = Math.ceil(timezoneDifference/mbtShift);
    if(timezoneDifference <=-8)
    {
        mbtDaysToShift = Math.ceil((24+timezoneDifference)/mbtShift);
    }

    mbtTarget = mbtStart.clone().add(mbtDaysToShift,'days');
    mbtTarget.add(timezoneDifference,"hours");
    //plan.minBodyTempEvents.addEvent("target min body temp",mbtTarget,moment.duration(0));





    // for sleep:
    // shift

    var sleepShifted = false;
    var nextSleep = sleepStart.clone();
    var mbtNext = mbtStart.clone();
    for(var i=0;i<mbtDaysToShift;i++)
    {
        mbtNext.add(1,'days').add(mbtShift,'hours');

        plan.minBodyTempEvents.addEvent(JetLag.Constants.EVENT_TYPE_MBT,mbtNext.clone(),moment.duration(0));


        //now sleep shift
        nextSleep.add(1,'days');
        if(sleepShifted === false)
        {
            if (config.shiftSpeed === JetLag.Constants.SHIFT_SPEED_IMMEDIATE && nextSleep > departTime)
            {
                nextSleep.add((mbtDaysToShift-i)*mbtShift,'hours');
                sleepShifted =true;
            }else
            {
                nextSleep.add(mbtShift,'hours');
            }
        }
        var nextSleepEvent = plan.sleepEvents.addEvent(JetLag.Constants.EVENT_TYPE_SLEEP,nextSleep.clone(),sleepDuration);

        var seekLight, seekDark;
        if(mbtNext > nextSleep && mbtNext < nextSleep.clone().add(sleepDuration))
        {
            if(phaseDirection === JetLag.Constants.PHASE_DELAY)
            {
                seekLight = nextSleep.clone().subtract(2,'hours');
                seekDark  = nextSleep.clone().add(sleepDuration);

            }else
            {
                seekLight = nextSleep.clone().add(sleepDuration);
                seekDark = nextSleep.clone().subtract(2,'hours');
            }
        }else
        {
            if(phaseDirection === JetLag.Constants.PHASE_DELAY)
            {
                seekLight = mbtNext.clone().subtract(2,'hours');
                seekDark  = mbtNext.clone();

            }else
            {
                seekLight = mbtNext.clone();
                seekDark = mbtNext.clone().subtract(2,'hours');
            }
        }
        plan.lightEvents.addEvent(JetLag.Constants.EVENT_TYPE_LIGHT,seekLight,moment.duration(2,'hours'));
        plan.lightEvents.addEvent(JetLag.Constants.EVENT_TYPE_DARK,seekDark,moment.duration(2,'hours'));


    }
    //check if last sleep is before flight
    if(nextSleep < departTime)
    {
        nextSleep.add(1,'days');
        plan.sleepEvents.addEvent(JetLag.Constants.EVENT_TYPE_SLEEP,nextSleep.clone(),sleepDuration);

    }


    // now calculate sleep plan

    return plan;
}

JetLag.Core.prototype.getTimezoneDifference = function(fromTimezone, toTimezone)
{
    // get the current time so we know which offset to take (DST is such bullkitten)
    var now = moment.utc();
// get the zone offsets for this time, in minutes
    var fromTimezoneOffset = moment.tz.zone(fromTimezone).offset(now);
    var toTimezoneOffset = moment.tz.zone(toTimezone).offset(now);

// calculate the difference in hours
    return ((toTimezoneOffset - fromTimezoneOffset ) / 60);
};

JetLag.Core.prototype.parseTimeString = function(timeString)
{
    return moment(timeString, ['h:m ', 'H:m','h:m a', 'H:m a', 'h a', 'H a', 'ha', 'Ha', 'h', 'H']);
};


// Export the JetLag object for **Node.js**, with
// backwards-compatibility for their old module API. If we're in
// the browser, add `JetLag` as a global object.
// (`nodeType` is checked to ensure that `module`
// and `exports` are not HTML elements.)
if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
        exports = module.exports = JetLag;
    }
    exports.JetLag = JetLag;
}
