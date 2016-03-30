# JetLagCore
#### Version 1.1

JetLagCore is a javascript module that calculates schedules for sleep and light exposure that help users minimize the effect of jet lag.

## Overview
The library lives in the global namespace `JetLag`.
Within the `JetLag` namespace there are 5 classes:
- `JetLag.Core` : This is the primary interface for the library and contains the main getPlan method.
- `JetLag.Plan` : This is the object returned by core that will include the list of events. See the section on the plan for more info.
- `JetLag.Constants` : This object contains various constants used in the application and for input data.
- `JetLag.Event` : This is the main object within a plan, and contains a event type (i.e. sleep, flight, seek light, etc), a start moment, duration, and end moment.
- `JetLag.EventCollection`: This is a wrapper for the arrays of events, and includes some convenience methods.
This object extends the javascript array primitive and can be used in the same way as an normal javascript array (i.e. allEvents.forEach(...))

## Prerequisites
- [Moment.js](http://momentjs.com/) v2.x -
- [Moment Timezone](http://momentjs.com/timezone/) v0.5.x

MomentJS and the companion Moment Timezone library are critical components of the library.
All date/times are returned as MomentJS moments and all durations are returned as MomentJS durations.
Please see the MomentJS documentation for more information.

## Usage
A full example usage of the library can be found in
`
examples/jet-lag-core-example.html
`

include the library in your app after including MomentJS
```html
<script src="../build/JetLagCore.js" type="text/javascript"></script>
```

Create a new object and pass the input data object to the `getPlan` method.
```javascript
var core = new JetLag.Core();
var plan = core.getPlan(config);
// do something with the plan ...
```

## Config Object
The following is an example definition of the input config object
```javascript
var config = {
    departureCity:      "New York City, United States",
    departureTimezone:  "America/New_York",
    departureDatetime:  "2016-05-08 21:30",
    arrivalCity:        "Paris, France",
    arrivalTimezone:    "Europe/Paris",
    arrivalDatetime:    "2016-05-09 11:05",
    sleepTime:          "22:00",
    wakeTime:           "06:00",
    planStart:          JetLag.Constants.PLAN_START_3_DAYS_ADVANCE,
    shiftSpeed:         JetLag.Constants.SHIFT_SPEED_IMMEDIATE
}

```

### Config object property definitions
#### Departure City
- Type: String
- City name indicating the location where the user will be starting their plan.

#### Departure Timezone
- Type: String
- Timezone name string for the departure city. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for list of valid values.

#### Departure Datetime
- Type: String
- The date and time of the user departure flight, in the format yyyy-mm-dd hh:mm

#### Arrival City
- Type: String
- City name indicating the location where the user will be starting their plan

#### Arrival Timezone
- Type: String
- Timezone name string for the arrival city. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for list of valid values.

#### Arrival Datetime
- Type: String
- The date and time of the user's flight arrives at the destination, in the format yyyy-mm-dd hh:mm

#### Normal Sleep Time
- Type: String
- The normal time the user goes to sleep in 24hour format (i.e 06:00 or 22:00)

#### Normal Wake Time
- Type: String
- The normal time the user wakes up in 24hour format (i.e 06:00 or 22:00)

#### Plan Start Date
Setting indicating when the plan should start. Possible values could be 3 days before departure, departure date, arrival date, etc.
Use the `JetLag.Constants` when setting this value; available options are:
- `JetLag.Constants.PLAN_START_3_DAYS_ADVANCE`
- `JetLag.Constants.PLAN_START_DEPARTURE`
- `JetLag.Constants.PLAN_START_ARRIVAL`

#### Sleep Shift Speed on Arrival
This indicates whether to immediately switch the user's sleep time on arrival to their normal sleep time in the destination time zone or
 to gradual shift the sleep time to match the destination time zone.
Use the `JetLag.Constants` when setting this value; available options are:
- `JetLag.Constants.SHIFT_SPEED_GRADUAL`
- `JetLag.Constants.SHIFT_SPEED_IMMEDIATE`

## Output Plan
Calling getPlan on a JetLag.Core object will return an object of type JetLag.Plan.
The plan object contains four event collections:
- `plan.flightEvents` - this contains the flight event. This collection should only have one flight in this version. Future version may allow for more flights
- `plan.sleepEvents` - this contains all the sleep and wake events.
- `plan.mbtEvents` - this contains all the markers for the estimated minimum body temperatures (mbt). Displaying this may not be necessary
- `plan.lightEvents` - this contains all the 'seek light' or 'seek dark' events

To return a list of all events for a plan as one big array in either the departure or arrival timezone you can call either:
- `plan.getAllEventsInDepartureTimezone()`
- `plan.getAllEventsInArrivalTimezone()`

These two methods will return an array in chronological order of all events in the plan. You can the do a `switch(event.eventType)` to handle different events types.
See the Event object section for more information on handling event objects.

The plan object also contains `plan.config` which holds the original input config option that was passed to `core.getPlan(config)`

## Event object
The event object contains the following properties:
#### event.eventType
This is a string which will be set to one of the following values from `JetLag.Constants`:
- `JetLag.Constants.EVENT_TYPE_FLIGHT`
- `JetLag.Constants.EVENT_TYPE_SLEEP`
- `JetLag.Constants.EVENT_TYPE_WAKE`
- `JetLag.Constants.EVENT_TYPE_MBT`
- `JetLag.Constants.EVENT_TYPE_LIGHT`
- `JetLag.Constants.EVENT_TYPE_DARK`

#### event.startMoment
This is the start date and time of the event. This object is a MomentJS moment object. Please see the MomentJS documentaion for more information.

#### event.endMoment
This is the end date and time of the event. This object is a MomentJS moment object. Please see the MomentJS documentaion for more information.

#### event.duration
This is the duration of the event. This object is a MomentJS duration object. For example you can get the duration in hours using the following: `event.duration.asHours()`. Please see the MomentJS documentaion for more information.

## More examples
For a detailed example of usage, please see the example file located here:
`
examples/jet-lag-core-example.html
`

## Jet Lag Algorithm Overview
The following is a high level overview of the steps required to calculate the user’s sleep and light/dark plan.
- Lookup time zones for departure and arrival locations
- Estimate when the user’s body temperature reaches a minimum (MBT). If sleep length is 7 or fewer hours per night, assume MBT is 2 hours before the normal wake time. If sleep length is greater than 7 hours, assume MBT is 3 hours before the normal wake time.
- Determine whether user needs to advance or delay their circadian rhythms. If they are flying east (to a later time zone), such as from Los Angeles to New York, they will need to phase advance (shift sleep earlier). Otherwise, if they are flying west, they will need to phase delay (shift sleep later).
- If the user needs to phase advance, schedule user to avoid light for 4 hours before body temperature minimum, and seek light for 4 hours after it. If the user needs to phase delay, do the opposite.
- Shift the estimated body temperature minimum by one hour earlier per day if phase advancing, or one and a half hours later per day if phase delaying.


## Useful Links
- [Eastman & Burgess, 2009 - How To Travel the World Without Jet lag](http://www.ncbi.nlm.nih.gov/pmc/articles/PMC2829880/)
- [Kolla & Auger, 2011 Jet lag - How To Help Reset The Internal Clock](http://www.ccjm.org/index.php?id=107937&tx_ttnews[tt_news]=364961&cHash=1457c781324647cd163d86de6d24bb4b)
- [Scientific American - How To Prevent Jet Lag](http://www.scientificamerican.com/article/how-to-prevent-jet-lag/)
- Studies Regarding Effectiveness
  - [psychiatryonline](http://ps.psychiatryonline.org/doi/pdf/10.1176/appi.ps.54.3.394)
  - [nih article](http://www.ncbi.nlm.nih.gov/pmc/articles/PMC1262683/)
- [Existing Implementation - JetLag Rooster](http://www.jetlagrooster.com/)
