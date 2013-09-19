# Parallax.js - *now with headtracking support*

Simple, lightweight **Parallax Engine** that reacts to the orientation of a smart device. Where no gyroscope or motion detection hardware is available, the position of the cursor is used instead.

This version is a fork by [Christophe Rosset (@topheman)](https://github.com/topheman), from the original [Parallax.js by Matthew Wagerfield](https://github.com/wagerfield/parallax). It adds **headtracking support** to the original library. See **[Headtracking Support](#headtracking-support)** section for more infos.

Check out this **[demo](https://rawgithub.com/topheman/parallax/master/examples/simple.headtrackr.html)** to see it in action ! (better demo to come soon ...)

## Setup

Simply create a list of elements giving each item that you want to move within
your parallax scene a class of `layer` and a `data-depth` attribute specifying
its depth within the scene. A depth of **0** will cause the layer to remain
stationary, and a depth of **1** will cause the layer to move by the total
effect of the calculated motion. Values inbetween **0** and **1** will cause the
layer to move by an amount relative to the supplied ratio.

```html
<ul id="scene">
  <li class="layer" data-depth="0.00"><img src="layer6.png"></li>
  <li class="layer" data-depth="0.20"><img src="layer5.png"></li>
  <li class="layer" data-depth="0.40"><img src="layer4.png"></li>
  <li class="layer" data-depth="0.60"><img src="layer3.png"></li>
  <li class="layer" data-depth="0.80"><img src="layer2.png"></li>
  <li class="layer" data-depth="1.00"><img src="layer1.png"></li>
</ul>
```

To kickoff a **Parallax** scene, simply select your parent DOM Element and pass
it to the **Parallax** constructor.

```javascript
var scene = document.getElementById('scene');
var parallax = new Parallax(scene);
```

## Behaviours

There are a number of behaviours that you can setup for any given **Parallax**
instance. These behaviours can either be specified in the markup via data
attributes or in JavaScript via the constructor and API.

| Behavior      | Values              | Description                                                                                                        |
| ------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `calibrate-x` | `true` or `false`   | Specifies whether or not to cache & calculate the motion relative to the initial `x` axis value on initialisation. |
| `calibrate-y` | `true` or `false`   | Specifies whether or not to cache & calculate the motion relative to the initial `y` axis value on initialisation. |
| `invert-x`    | `true` or `false`   | `true` moves layers in opposition to the device motion, `false` slides them away.                                  |
| `invert-y`    | `true` or `false`   | `true` moves layers in opposition to the device motion, `false` slides them away.                                  |
| `limit-x`     | `number` or `false` | A numeric value limits the total range of motion in `x`, `false` allows layers to move with complete freedom.      |
| `limit-y`     | `number` or `false` | A numeric value limits the total range of motion in `y`, `false` allows layers to move with complete freedom.      |
| `scalar-x`    | `number`            | Multiplies the input motion by this value, increasing or decreasing the sensitivity of the layer motion.           |
| `scalar-y`    | `number`            | Multiplies the input motion by this value, increasing or decreasing the sensitivity of the layer motion.           |
| `friction-x`  | `number` `0 - 1`    | The amount of friction the layers experience. This essentially adds some easing to the layer motion.               |
| `friction-y`  | `number` `0 - 1`    | The amount of friction the layers experience. This essentially adds some easing to the layer motion.               |

In addition to the behaviours described above, there are **two** methods `enable()`
and `disable()` that *activate* and *deactivate* the **Parallax** instance respectively.

### Behaviors: Data Attributes Example

```html
<ul id="scene"
  data-calibrate-x="false"
  data-calibrate-y="true"
  data-invert-x="false"
  data-invert-y="true"
  data-limit-x="false"
  data-limit-y="10"
  data-scalar-x="2"
  data-scalar-y="8"
  data-friction-x="0.2"
  data-friction-y="0.8">
  <li class="layer" data-depth="0.00"><img src="graphics/layer6.png"></li>
  <li class="layer" data-depth="0.20"><img src="graphics/layer5.png"></li>
  <li class="layer" data-depth="0.40"><img src="graphics/layer4.png"></li>
  <li class="layer" data-depth="0.60"><img src="graphics/layer3.png"></li>
  <li class="layer" data-depth="0.80"><img src="graphics/layer2.png"></li>
  <li class="layer" data-depth="1.00"><img src="graphics/layer1.png"></li>
</ul>
```

### Behaviors: Constructor Object Example

```javascript
var scene = document.getElementById('scene');
var parallax = new Parallax(scene, {
  calibrateX: false,
  calibrateY: true,
  invertX: false,
  invertY: true,
  limitX: false,
  limitY: 10,
  scalarX: 2,
  scalarY: 8,
  frictionX: 0.2,
  frictionY: 0.8
});
```

### Behaviors: API Example

```javascript
var scene = document.getElementById('scene');
var parallax = new Parallax(scene);
parallax.enable();
parallax.disable();
parallax.calibrate(false, true);
parallax.invert(false, true);
parallax.limit(false, 10);
parallax.scalar(2, 8);
parallax.friction(0.2, 0.8);
```

## jQuery

If you're using **[jQuery][jquery]** or **[Zepto][zepto]** and would prefer to
use **Parallax.js** as a plugin, you're in luck!

```javascript
$('#scene').parallax();
```

### jQuery: Passing Options

```javascript
$('#scene').parallax({
  calibrateX: false,
  calibrateY: true,
  invertX: false,
  invertY: true,
  limitX: false,
  limitY: 10,
  scalarX: 2,
  scalarY: 8,
  frictionX: 0.2,
  frictionY: 0.8
});
```
### jQuery: API

```javascript
var $scene = $('#scene').parallax();
$scene.parallax('enable');
$scene.parallax('disable');
$scene.parallax('calibrate', false, true);
$scene.parallax('invert', false, true);
$scene.parallax('limit', false, 10);
$scene.parallax('scalar', 2, 8);
$scene.parallax('friction', 0.2, 0.8);
```

## Headtracking support

Use Parallax.js just as you would. But rather than devicemotion, use headtracking with your webcam. Thanks to Audun Mathias Øygard for his [headtrackr.js](https://github.com/auduno/headtrackr) library.

Don't forget to insert the `headtrackr.js` or `headtrackr.min.js` script in your page or specify it in the options in `headtrackr-script-location` (for lazy load). 

Some getUserMedia feature detection is done, if you're not on firefox or chrome (which implement the feature at the moment), the headtrackr script won't even be downloaded and you'll have a message telling you that headtracking won't work and falls back to normal behaviour.

You can test the headtracking version of the simple demo here :

* [with Parallax](https://rawgithub.com/topheman/parallax/master/examples/simple.headtrackr.html)
* [with the Parallax jQuery plugin](https://rawgithub.com/topheman/parallax/master/examples/jquery.headtrackr.html)

### Headtracking - Behaviors: Constructor Object Example

```javascript
var scene = document.getElementById('scene');
var parallax = new Parallax(scene, {
  // … set any of the usual parallax behaviours, then set the headtrackr ones
  headtrackr:true,
  headtrackrPreferDeviceMotion:false,//if on a device that supports both getUserMedia and accelerometer, false -> will use headtrackr, true -> will use DeviceMotion (true by default to keep with parallax.js)
  scalarX: 15.0,
  scalarY: 15.0,
//  headtrackrDisplayVideo:true, //no need if you set headtrackrDebugView at true
  headtrackrDebugView: true,
  invertX:false,
  invertY:false,
  headtrackrScriptLocation: "../deploy/headtrackr.min.js",
  headtrackrNoGetUserMediaCallback: function(){
    console.log('Write your own message function like a modal or anything better than the ugly message I made up … ;-)');
  }
});
```

### Headtracking - Behaviors: API Example

```javascript
var scene = document.getElementById('scene');
var parallax = new Parallax(scene);
parallax.headtrackrScalar(2, 8);
```

### Headtracking - jQuery: Passing Options

```javascript
$('#scene').parallax({
  // … set any of the usual parallax behaviours, then set the headtrackr ones
  headtrackr:true,
  headtrackrPreferDeviceMotion:false,//if on a device that supports both getUserMedia and accelerometer, false -> will use headtrackr, true -> will use DeviceMotion (true by default to keep with parallax.js)
  scalarX: 15.0,
  scalarY: 15.0,
//  headtrackrDisplayVideo:true, //no need if you set headtrackrDebugView at true
  headtrackrDebugView: true,
  invertX:false,
  invertY:false,
  headtrackrScriptLocation: "../deploy/headtrackr.min.js",
  headtrackrNoGetUserMediaCallback: function(){
    console.log('Write your own message function like a modal or anything better than the ugly message I made up … ;-)');
  }
});
```

### Headtracking - jQuery: API Example

```javascript
var $scene = $('#scene').parallax();
$scene.parallax('headtrackrScalar', 2, 8);
```

### Headtracking behaviours

Keep in mind that to activate headtracking **you only have to put `headtrackr` option to `true`**, the other parameters are optional (except `headtrackr-script-location`, unless you already have included the `headtrackr.js` script).

| Behavior                         | Values              | Description                                                                                                                                                      |
| -------------------------------- | ------------------- | -----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `headtrackr`                     | `true` or `false`   | Activates headtracking in parallax (you will be asked to allow the access to your webcam) - it disables devicemotion events and uses mouse if headtracking fails |              
| `headtrackr-display-video`       | `true` or `false`   | Specifies whether or not to display the webcam video stream (`false` by default)                                                                                 |
| `headtrackr-scalar-x`            | `number`            | Multiplies the input motion given by headtrackr by this value (will be affected by scalar-x)                                                                     |
| `headtrackr-scalar-y`            | `number`            | Multiplies the input motion given by headtrackr by this value (will be affected by scalar-y)                                                                     |
| `headtrackr-debug-view`          | `true` or `false`   | Specifies whether or not to display the webcam video stream, with a box over your head (great for debugging) (`false` by default)                                |
| `headtrackr-script-location`     | `string`            | Location of the `headtrackr.js` or `headtrackr.min.js` script (lazy load for feature detection)                                                                  |
| `headtrackr-prefer-device-motion`| `true` or `false`   | If both accelerometer and headtracking are supported (like on tablets with chrome that support getUserMedia), choose which one use, `true` by default            |

## iOS

If you are writing a **native iOS application** and would like to use **parallax.js**
within a `UIWebView`, you will need to do a little bit of work to get it running.

`UIWebView` no longer automatically receives the `deviceorientation` event, so
your native application must intercept the events from the gyroscope and reroute
them to the `UIWebView`:

1. Include the **CoreMotion** framework `#import <CoreMotion/CoreMotion.h>`
and create a reference to the **UIWebView** `@property(nonatomic, strong) IBOutlet UIWebView *parallaxWebView;`
2. Add a property to the app delegate (or controller that will own the **UIWebView**)
`@property(nonatomic, strong) CMMotionManager *motionManager;`
3. Finally, make the following calls:

```Objective-C
  self.motionManager = [[CMMotionManager alloc] init];

  if (self.motionManager.isGyroAvailable && !self.motionManager.isGyroActive) {

    [self.motionManager setGyroUpdateInterval:0.5f]; // Set the event update frequency (in seconds)

    [self.motionManager startGyroUpdatesToQueue:NSOperationQueue.mainQueue
                                    withHandler:^(CMGyroData *gyroData, NSError *error) {

      NSString *js = [NSString stringWithFormat:@"parallax.onDeviceOrientation({beta:%f, gamma:%f})", gyroData.rotationRate.x, gyroData.rotationRate.y];

      [self.parallaxWebView stringByEvaluatingJavaScriptFromString:js];

    }];
  }
```

## Build

```
cd build
npm install
node build.js
```

## Authors

* Matthew Wagerfield: [@mwagerfield](http://twitter.com/mwagerfield)
* Christophe Rosset: [@topheman](http://twitter.com/topheman)

## License

Licensed under [MIT][mit]. Enjoy.

[demo]: http://topheman.github.io/parallax/
[mit]: http://www.opensource.org/licenses/mit-license.php
[jquery]: http://jquery.com/
[zepto]: http://zeptojs.com/
[headtrackr]: https://github.com/auduno/headtrackr
