/**
 * Created by johnuiterwyk on 3/12/16.
 */
if (typeof JetLag == "undefined") {
    var JetLag = {};
};

JetLag.Event = function(title,startTime, duration)
{

    this.title = title;
    this.startTime = startTime;
    this.endTime = moment(startTime).add(duration,"hours");
    this.duration = duration;

};

JetLag.Event.prototype.toString = function()
{
    return "Event: " + this.title + ", start: " +this.startTime.toString()+", end:"+this.endTime.toString() + "\n";
};