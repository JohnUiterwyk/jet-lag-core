/**
 * Created by johnuiterwyk on 3/12/16.
 */
if (typeof JetLag == "undefined") {
    var JetLag = {};
};

JetLag.Plan = function()
{
    this.events = [];
};

JetLag.Plan.prototype.toString = function()
{
    var result = "";
    for(var i=0;i<this.events.length;i++)
    {
        result += this.events[i].toString();
    }
    return result;
};

JetLag.Plan.prototype.addEvent = function(title,startTime, duration)
{
    var event = new JetLag.Event(title,startTime, duration);
    this.events.push(event);
};