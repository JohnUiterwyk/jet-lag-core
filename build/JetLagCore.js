/**
 * Created by johnuiterwyk on 3/12/16.
 */
if (typeof JetLag == "undefined") {
    var JetLag = {};
};
JetLag.Constants =
{
    PLAN_START_3_DAYS_ADVANCE: "PLAN_START_3_DAYS_ADVANCE",
    PLAN_START_DEPARTURE: "PLAN_START_DEPARTURE",
    PLAN_START_ARRIVAL:"PLAN_START_ARRIVAL",
    SHIFT_SPEED_GRADUAL:"SHIFT_SPEED_GRADUAL",
    SHIFT_SPEED_IMMEDIATE:"SHIFT_SPEED_IMMEDIATE",
    PHASE_ADVANCE:"PHASE_ADVANCE",
    PHASE_DELAY:"PHASE_DELAY",
    EVENT_TYPE_FLIGHT:"Flight",
    EVENT_TYPE_SLEEP:"Sleep",
    EVENT_TYPE_MBT:"mbt",
    EVENT_TYPE_LIGHT:"Seek Light",
    EVENT_TYPE_DARK:"Seek Dark",
}
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
    var plan = new JetLag.Plan();
    plan.departureTimezone = config.departureTimezone;
    plan.arrivalTimezone = config.arrivalTimezone;

    // first convert times to moment objects
    var departTime = moment.tz(config.departureDatetime, config.departureTimezone);
    var arrivalTime = moment.tz(config.arrivalDatetime, config.arrivalTimezone);

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
    sleepStart.tz(inputData.departureTimezone);
    // set the hour and minute using normal sleep time
    sleepStart.hours(normalSleepTime.hour());
    sleepStart.minutes(normalSleepTime.minute());

    //
    plan.sleepEvents.addEvent(JetLag.Constants.EVENT_TYPE_SLEEP,sleepStart,sleepDuration);


    if(sleepDuration <= 7)
    {
        mbtStart = sleepStart.clone().add(sleepDuration).subtract(2,"hours");
    }else
    {
        mbtStart = sleepStart.clone().add(sleepDuration).subtract(3,"hours");
    }
    plan.minBodyTempEvents.addEvent(JetLag.Constants.EVENT_TYPE_MBT,mbtStart,moment.duration(0));


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

        var seekLight, seekDark;

        if(phaseDirection === JetLag.Constants.PHASE_DELAY)
        {
            plan.lightEvents.addEvent(JetLag.Constants.EVENT_TYPE_LIGHT,mbtNext.clone().subtract(2,'hours'),moment.duration(2,'hours'));
            plan.lightEvents.addEvent(JetLag.Constants.EVENT_TYPE_DARK,mbtNext.clone(),moment.duration(2,'hours'));
        }else
        {
            plan.lightEvents.addEvent(JetLag.Constants.EVENT_TYPE_DARK,mbtNext.clone().subtract(2,'hours'),moment.duration(2,'hours'));
            plan.lightEvents.addEvent(JetLag.Constants.EVENT_TYPE_LIGHT,mbtNext.clone(),moment.duration(2,'hours'));

        }

        //now sleep shift
        nextSleep.add(1,'days');
        if(sleepShifted === false)
        {
                if (config.shiftSpeed === JetLag.Constants.SHIFT_SPEED_IMMEDIATE && nextSleep > arrivalTime)
                {
                    nextSleep.add((mbtDaysToShift-i)*mbtShift,'hours');
                    sleepShifted =true;
                }else
                {
                    nextSleep.add(mbtShift,'hours');
                }
        }
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

/**
 * Created by johnuiterwyk on 3/12/16.
 */
if (typeof JetLag == "undefined") {
    var JetLag = {};
};

JetLag.Event = function(eventType,startMoment, duration)
{

    this.eventType = eventType;
    this.startMoment = startMoment;
    this.endMoment = moment(startMoment).add(duration);
    this.duration = duration;

};

JetLag.Event.prototype.toString = function()
{
    var result = ""
        result += "" +this.startMoment.format('YYYY-MM-DD HH:mm')+"<br/>";
        result += "- type: " + this.eventType +"<br/>";
        result += "- duration: " +this.duration.asHours()+" hours<br/>";
        result += "- end: "+this.endMoment.format('YYYY-MM-DD HH:mm') +"<br/><br/>";
    return result;
};

JetLag.Event.prototype.compare = function compare(a, b) {
    if (a.startMoment < b.startMoment) {
        return -1;
    }
    if (a.startMoment > b.startMoment) {
        return 1;
    }
    // a must be equal to b
    return 0;
};

JetLag.Event.prototype.contains = function(targetMoment)
{
    return(startMoment <= targetMoment && targetMoment <=endMoment);
}
/**
 * Created by johnuiterwyk on 3/13/16.
 */
/**
 * Created by johnuiterwyk on 3/12/16.
 */
if (typeof JetLag == "undefined") {
    var JetLag = {};
};

JetLag.EventCollection = function(initArray)
{
    if(typeof(initArray) !== "undefined")
    {
        for(var i=0;i<initArray.length;i++)
        {
            this.push(initArray[i]);
        }
        this.sortEvents();
    }
};
JetLag.EventCollection.prototype = [];

JetLag.EventCollection.prototype.toString = function()
{
    var result = "";
    for(var i=0;i<this.length;i++)
    {
        result += this[i].toString();
    }
    return result;
};

JetLag.EventCollection.prototype.addEvent = function(title,startTime, duration)
{
    var event = new JetLag.Event(title,startTime, duration);
    this.push(event);
    this.sortEvents();
};

JetLag.EventCollection.prototype.getStartMoment = function()
{
    var startMoment = null;
    this.forEach(function(currentEvent,index,targetArray)
    {
        if(startMoment === null || currentEvent.startMoment < startMoment)
        {
            startMoment = currentEvent.startMoment;
        }
    });
    return startMoment;
};

JetLag.EventCollection.prototype.getEndMoment = function()
{

    var endMoment = null;
    this.forEach(function(currentEvent,index,targetArray)
    {
        if(endMoment === null || currentEvent.endMoment > endMoment)
        {
            endMoment = currentEvent.endMoment;
        }
    });
    return endMoment;
}
JetLag.EventCollection.prototype.getTotalDuration = function()
{

    return moment.duration(this.getEndMoment().diff(this.getStartMoment()));
}

JetLag.EventCollection.prototype.sortEvents = function()
{
    this.sort(JetLag.Event.compare);
}

JetLag.EventCollection.prototype.setTimezone = function(timezone)
{
    this.forEach(function(currentEvent)
    {
        currentEvent.startMoment.tz(timezone);
        currentEvent.endMoment.tz(timezone);
    });
};
/**
 * Created by johnuiterwyk on 3/12/16.
 */
if (typeof JetLag == "undefined") {
    var JetLag = {};
};

JetLag.Plan = function()
{
    
    this.flightEvents = new JetLag.EventCollection();
    this.sleepEvents = new JetLag.EventCollection();
    this.minBodyTempEvents = new JetLag.EventCollection();
    this.lightEvents = new JetLag.EventCollection();
    this.departureTimezone = '"';
    this.arrivalTimezone = "";
};

JetLag.Plan.prototype.toString = function()
{
    return this.getAllEvents().toString();
};


JetLag.Plan.prototype.getStartMoment = function()
{
    return this.getAllEvents().getStartMoment();
};

JetLag.Plan.prototype.getEndMoment = function()
{
    return this.getAllEvents().getEndMoment();
}
JetLag.Plan.prototype.getTotalDuration = function()
{

    var allEvents = this.getAllEvents();
    return moment.duration(allEvents.getEndMoment().diff(allEvents.getStartMoment()));
}

JetLag.Plan.prototype.getAllEvents = function()
{
    var result = [];
    result.push.apply(result, this.sleepEvents);
    result.push.apply(result, this.minBodyTempEvents);
    result.push.apply(result, this.lightEvents);
    result.push.apply(result, this.flightEvents);
    return new JetLag.EventCollection(result);
};

JetLag.Plan.prototype.getAllEventsInDepartureTimezone = function()
{
    var result = this.getAllEvents();
    result.setTimezone(this.departureTimezone);
    return result;
};
JetLag.Plan.prototype.getAllEventsInArrivalTimezone = function()
{
    var result = this.getAllEvents();
    result.setTimezone(this.arrivalTimezone);
    return result;
};