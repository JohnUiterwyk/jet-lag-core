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