/**
 * Created by johnuiterwyk on 3/4/16.
 */
var JetLagCore = function()
{

};
JetLagCore.prototype.getLengthOfSleep = function(sleepTimeString, wakeTimeString)
{
    var sleepTime = moment(sleepTimeString, ['h:m a', 'H:m', 'h a', 'H a', 'ha', 'Ha', 'h', 'H']);
    var wakeTime = moment(wakeTimeString,['h:m a', 'H:m', 'h a', 'H a', 'h', 'H']);
    if(wakeTime < sleepTime)
    {
        wakeTime = moment(wakeTime).add('24','hours')
    }
    var duration = moment.duration(wakeTime.diff(sleepTime));
    var hours = duration.asHours();
    return hours;
};
