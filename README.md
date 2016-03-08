# JetLagCore
JetLagCore is a javascript module that calculates schedules for sleep and light exposure that help users minimize he effect of jet lag.

## Prerequisites
- [MomentJS](http://momentjs.com/) v2.x

## Usage
include the library in your app after including MomentJS
```html
<script src="../lib/JetLagCore.js" type="text/javascript"></script>
```

The library lives in the global namespace `JetLag`. With `JetLag` is the `Core` class.
Create a new object and pass the input data object to the `getPlan` method.
```javascript
var core = new JetLag.Core();
var plan = core.getPlan(inputData);
```

## Input Data Object
The following is an example definition of the input object
```javascript
var inputData = {
    departureCity:      "New York City, United States",
    departureTimezone:  "America/New_York",
    departureDatetime:  "2016-05-08 21:30",
    arrivalCity:        "Paris, France",
    arrivalTimezone:    "Europe/Paris",
    arrivalDatetime:    "2016-05-09 11:05",
    sleepTime:          "22:00",
    wakeTime:           "06:00",
    planStart:          "arrival",
    shiftSpeed:         "gradual"
}

```

### Input Properties
#### Departure City
City name indicating the location where the user will be starting their plan
#### Departure Timezone
Timezone string for the departure city
#### Departure Datetime
The date and time of the user departure flight
#### Arrival City
City name indicating the location where the user will be starting their plan
#### Arrival Timezone
Timezone string for the arrival city
#### Arrival Datetime
The date and time the user arrives in the destination
#### Normal Sleep Time
The normal time the user goes to sleep.
#### Normal Wake Time
The normal time the user wakes up.
#### Plan Start Date
Optional setting indicating when the plan should start.
Possible values could be 3 days before departure, departure date, arrival date, etc.
#### Sleep Shift Speed on Arrival
values : Immediate or Gradual

This indicates whether to immediately switch the user's sleep time on arrival to their normal sleep time in the destination time zone or to gradual shift the sleep time to match the destination time zone.


## Output Data Object
The following is an example output object
```javascript
{
    inputData: {},
    events:[]
}
```

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
