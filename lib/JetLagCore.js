/**
 * Created by johnuiterwyk on 3/4/16.
 */
var JetLagCore = function()
{

};
JetLagCore.prototype.getPlan = function(inputData)
{
    var result = {};

    return result;
}
JetLagCore.prototype.getLengthOfSleep = function(sleepTimeString, wakeTimeString)
{
    var sleepTime = this.parseTimeString(sleepTimeString);
    var wakeTime = this.parseTimeString(wakeTimeString);
    if(wakeTime < sleepTime)
    {
        wakeTime = moment(wakeTime).add('24','hours')
    }
    var duration = moment.duration(wakeTime.diff(sleepTime));
    var hours = duration.asHours();
    return hours;
};

JetLagCore.prototype.getMinimumBodyTemperatureTime = function(sleepTimeString, wakeTimeString)
{
    var wakeTime = this.parseTimeString(wakeTimeString);
    var mbtTime;
    if(this.getLengthOfSleep(sleepTimeString,wakeTimeString) <= 7)
    {
        mbtTime = moment(wakeTime).subtract(2,'hours');
    }else
    {
        mbtTime = moment(wakeTime).subtract(3,'hours');
    }
    return mbtTime;
};
JetLagCore.prototype.parseTimeString = function(timeString)
{
    return moment(timeString, ['h:m a', 'H:m', 'h a', 'H a', 'ha', 'Ha', 'h', 'H']);
}