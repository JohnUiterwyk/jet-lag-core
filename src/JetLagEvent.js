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