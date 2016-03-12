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
        departureCity:      "New York City, United States",
        departureTimezone:  "America/New_York",
        departureDatetime:  "2016-05-08 21:30",
        arrivalCity:        "Paris, France",
        arrivalTimezone:    "Europe/Paris",
        arrivalDatetime:    "2016-05-09 11:05",
        sleepTime:          "22:00",
        wakeTime:           "06:00",
        planStart:          "PLAN_START_ARRIVAL",
        shiftSpeed:         "SHIFT_SPEED_GRADUAL"
    }
};
JetLag.Core.prototype.getPlan = function(config)
{
    //create the holder for the plan.
    var plan = new JetLag.Plan();

    // first convert times to moment objects
    var departTime = moment.tz(config.departureDatetime, config.departureTimezone);
    var arrivalTime = moment.tz(config.arrivalDatetime, config.arrivalTimezone);

    //calculate duration of the flight, then add a flight event to the plan
    var flightDuration = moment.duration(departTime.diff(arrivalTime));
    plan.addEvent("flight",departTime,flightDuration);

    // calculate when to start the plan
    var planStartTime;
    switch(inputData.planStart)
    {
        case JetLag.Constants.PLAN_START_3_DAYS_ADVANCE:
            planStartTime = moment(departTime).subtract(3,"days").startOf("day");
            break;
        case JetLag.Constants.PLAN_START_DEPARTURE:
            planStartTime = moment(departTime);
            break;
        case JetLag.Constants.PLAN_START_ARRIVAL:
            planStartTime = moment(arrivalTime);
            break;
    }

    var timezoneDifference = this.getTimezoneDifference(config.departureTimezone, config.arrivalTimezone);

    var normalSleepTime, normalWakeTime, sleepDuration;
    normalSleepTime = this.parseTimeString(config.sleepTime);
    normalWakeTime = this.parseTimeString(config.wakeTime);
    if(normalWakeTime < normalSleepTime) {
        normalWakeTime = moment(normalWakeTime).add('24', 'hours')
    }
    sleepDuration = moment.duration(normalWakeTime.diff(normalSleepTime));

    var sleepStart, mbtOffset, mbtStart, phaseDirection, mbtShift;
    // first lets figure out the sleep / wake time to start from
    sleepStart =  moment(planStartTime).subtract(1,"days");
    // sleep start will always be in home timezone
    sleepStart.tz(inputData.departureTimezone);
    // set the hour and minute using normal sleep time
    sleepStart.hours(normalSleepTime.hours());
    sleepStart.minutes(normalSleepTime.minutes());
    if(sleepDuration <= 7)
    {
        mbtOffset = sleepDuration.subtract(2,"hours");
    }else
    {
        mbtOffset = sleepDuration.subtract(3,"hours");
    }
    mbtStart = moment(sleepStart).add(mbtOffset);

    if(timezoneDifference > 8 || timezoneDifference < 0)
    {
        phaseDirection = JetLag.Constants.PHASE_DELAY; //shift sleep later
        mbtShift = 2;
    }else
    {
        phaseDirection = JetLag.Constants.PHASE_ADVANCE; //shift sleep earlier
        mbtShift = -1;
    }


    // we can phase delay by 2 hours a day, and phase advance by one hour a day.
    //
    plan.addEvent("normal sleep",sleepStart,sleepDuration);

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
    return ((fromTimezoneOffset - toTimezoneOffset) / 60);
}
JetLag.Core.prototype.parseTimeString = function(timeString)
{
    return moment(timeString, ['h:m ', 'H:m','h:m a', 'H:m a', 'h a', 'H a', 'ha', 'Ha', 'h', 'H']);
}

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
} else {
    root.JetLag = JetLag;
}

