# JetLagCore
JetLagCore is a javascript module that calculates schedules for sleep and light exposure that help users minimize he effect of jet lag.
## Prerequisites
- [MomentJS](http://momentjs.com/) v2.x
## Usage
include the library in your app after including MomentJS
```html
<script src="../lib/JetLagCore.js" type="text/javascript"></script>
```

The library lives in the global object `JetLagCore`. Create a new object and pass the input data object to the `getPlan` method.
```javascript
var core = new JetLagCore();
var plan = core.getPlan(inputData);
```

## Input Data Object
The following is an example definition of the input object
```javascript
var inputData = {

}

```

## Output Data Object
The following is an example output object
```javascript
{
    inputData:{ ... },
    ... tbc ...
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
