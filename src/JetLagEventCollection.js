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