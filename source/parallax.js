/**
 * Parallax.js
 * @author Matthew Wagerfield - @mwagerfield
 * @description Creates a parallax effect between an array of layers,
 *              driving the motion from the gyroscope output of a smartdevice.
 *              If no gyroscope is available, the cursor position is used.
 */
;(function(window, document, undefined) {

  var NAME = 'Parallax';
  var MAGIC_NUMBER = 30;
  var DEFAULTS = {
    calibrationThreshold: 100,
    calibrationDelay: 500,
    supportDelay: 500,
    calibrateX: false,
    calibrateY: true,
    invertX: true,
    invertY: true,
    limitX: false,
    limitY: false,
    scalarX: 10.0,
    scalarY: 10.0,
    frictionX: 0.1,
    frictionY: 0.1,
    headtrackr: false,
    headtrackrDisplayVideo: false,
    headtrackrDebugView: false,
    headtrackrScalarX: 3,
    headtrackrScalarY: 3
  };

  function Parallax(element, options) {

    // DOM Context
    this.element = element;
    this.layers = element.getElementsByClassName('layer');

    // Data Extraction
    var data = {
      calibrateX: this.data(this.element, 'calibrate-x'),
      calibrateY: this.data(this.element, 'calibrate-y'),
      invertX: this.data(this.element, 'invert-x'),
      invertY: this.data(this.element, 'invert-y'),
      limitX: this.data(this.element, 'limit-x'),
      limitY: this.data(this.element, 'limit-y'),
      scalarX: this.data(this.element, 'scalar-x'),
      scalarY: this.data(this.element, 'scalar-y'),
      frictionX: this.data(this.element, 'friction-x'),
      frictionY: this.data(this.element, 'friction-y'),
      headtrackr: this.data(this.element, 'headtrackr'),
      headtrackrDisplayVideo: this.data(this.element, 'headtrackr-display-video'),
      headtrackrDebugView: this.data(this.element, 'headtrackr-debug-view'),
      headtrackrScalarX: this.data(this.element, 'headtrackr-scalar-x'),
      headtrackrScalarY: this.data(this.element, 'headtrackr-scalar-y')
    };

    // Delete Null Data Values
    for (var key in data) {
      if (data[key] === null) delete data[key];
    }

    // Compose Settings Object
    this.extend(this, DEFAULTS, options, data);

    // States
    this.calibrationTimer = null;
    this.calibrationFlag = true;
    this.enabled = false;
    this.depths = [];
    this.raf = null;

    // Offset
    this.ox = 0;
    this.oy = 0;
    this.ow = 0;
    this.oh = 0;

    // Calibration
    this.cx = 0;
    this.cy = 0;

    // Input
    this.ix = 0;
    this.iy = 0;

    // Motion
    this.mx = 0;
    this.my = 0;

    // Velocity
    this.vx = 0;
    this.vy = 0;

    // Callbacks
    this.onFaceTracking = this.onFaceTracking.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onDeviceOrientation = this.onDeviceOrientation.bind(this);
    this.onOrientationTimer = this.onOrientationTimer.bind(this);
    this.onCalibrationTimer = this.onCalibrationTimer.bind(this);
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    // Initialise
    this.initialise();
  }

  Parallax.prototype.extend = function() {
    if (arguments.length > 1) {
      var master = arguments[0];
      for (var i = 1, l = arguments.length; i < l; i++) {
        var object = arguments[i];
        for (var key in object) {
          master[key] = object[key];
        }
      }
    }
  };

  Parallax.prototype.data = function(element, name) {
    return this.deserialize(element.getAttribute('data-'+name));
  };

  Parallax.prototype.deserialize = function(value) {
    if (value === "true") {
      return true;
    } else if (value === "false") {
      return false;
    } else if (value === "null") {
      return null;
    } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
      return parseFloat(value);
    } else {
      return value;
    }
  };

  Parallax.prototype.offset = function(element) {
    var x = 0, y = 0;
    while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
      x += element.offsetLeft - element.scrollLeft;
      y += element.offsetTop - element.scrollTop;
      element = element.offsetParent;
    }
    return {top:y, left:x};
  };

  Parallax.prototype.camelCase = function(value) {
    return value.replace(/-+(.)?/g, function(match, character){
      return character ? character.toUpperCase() : '';
    });
  };

  Parallax.prototype.transformSupport = function(value) {
    var element = document.createElement('div');
    var propertySupport = false;
    var propertyValue = null;
    var featureSupport = false;
    var cssProperty = null;
    var jsProperty = null;
    for (var i = 0, l = this.vendors.length; i < l; i++) {
      if (this.vendors[i] !== null) {
        cssProperty = this.vendors[i][0] + 'transform';
        jsProperty = this.vendors[i][1] + 'Transform';
      } else {
        cssProperty = 'transform';
        jsProperty = 'transform';
      }
      if (element.style[jsProperty] !== undefined) {
        propertySupport = true;
        break;
      }
    }
    switch(value) {
      case '2D':
        featureSupport = propertySupport;
        break;
      case '3D':
        if (propertySupport) {
          document.body.appendChild(element);
          element.style[jsProperty] = 'translate3d(1px,1px,1px)';
          propertyValue = window.getComputedStyle(element).getPropertyValue(cssProperty);
          featureSupport = propertyValue !== undefined && propertyValue.length > 0 && propertyValue !== "none";
          document.body.removeChild(element);
        }
        break;
    }
    return featureSupport;
  };

  Parallax.prototype.ww = null;
  Parallax.prototype.wh = null;
  Parallax.prototype.hw = null;
  Parallax.prototype.hh = null;
  Parallax.prototype.portrait = null;
  Parallax.prototype.desktop = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i);
  Parallax.prototype.vendors = [null,['-webkit-','webkit'],['-moz-','Moz'],['-o-','O'],['-ms-','ms']];
  Parallax.prototype.motionSupport = !!window.DeviceMotionEvent;
  Parallax.prototype.orientationSupport = !!window.DeviceOrientationEvent;
  Parallax.prototype.orientationStatus = 0;
  Parallax.prototype.transform2DSupport = Parallax.prototype.transformSupport('2D');
  Parallax.prototype.transform3DSupport = Parallax.prototype.transformSupport('3D');

    Parallax.prototype.launchHeadtrackr = function() {
      
      if(typeof headtrackr === "undefined"){
        throw new Error("To use the headtrackr feature, you need to include the headtrakr.js or headtrackr.min.js script before the parallax one");
      }
      
      var inputVideo = document.createElement('video'),
          canvasInput = document.createElement('canvas'),
          canvasDebug = null,
          videoWidth = "320",
          videoHeight = "240",
          headtrackrOptions = {},
          self;
  
      //add the mousemove listener while connecting the camera
      //we'll remove it when the face is detected to plug trackr
      //then readd it when the trackr fails
      window.addEventListener('mousemove', this.onMouseMove);
  
      inputVideo.autoplay = true;
      inputVideo.loop = true;
      inputVideo.style.display = "none";
      inputVideo.width = videoWidth;
      inputVideo.height = videoHeight;
      
      canvasInput.style.position = "absolute";
      canvasInput.style.bottom = "0px";
      canvasInput.style.right = "0px";
      canvasInput.width = videoWidth;
      canvasInput.height = videoHeight;
      
      if(this.headtrackrDisplayVideo === true){
        canvasInput.style.display = "block"; 
        if(this.headtrackrDebugView === true){
          canvasDebug = document.createElement('canvas');
          canvasDebug.style.display = "block";
          canvasDebug.style.position = "absolute";
          canvasDebug.style.bottom = "0px";
          canvasDebug.style.right = "0px";
          canvasDebug.width = videoWidth;
          canvasDebug.height = videoHeight;
          headtrackrOptions.calcAngles = true;
        }
      }
      else{
        this.headtrackrDebugView = false;
        canvasInput.style.display = "none";          
      }
      
      this.htrackr = new headtrackr.Tracker(headtrackrOptions);
      
      document.getElementsByTagName('body')[0].appendChild(inputVideo);
      document.getElementsByTagName('body')[0].appendChild(canvasInput);
      if(canvasDebug !== null){
        document.getElementsByTagName('body')[0].appendChild(canvasDebug);
        this.htrackr.canvasDebug = canvasDebug;
        this.htrackr.ctxDebug = canvasDebug.getContext('2d');
      }
      
      this.htrackr.init(inputVideo, canvasInput);
      this.htrackr.start();
      this.htrackr.canvasInputInfos = {
        ww : canvasInput.width,
        wh : canvasInput.height,
        hw : canvasInput.width / 2,
        hh : canvasInput.height / 2
      };
      
      self = this;
      document.addEventListener('headtrackrStatus', function(e){
        console.log(e.status,e.type,e.timeStamp);
        if(e.status === "found"){
          window.removeEventListener('mousemove', self.onMouseMove);
          document.addEventListener("facetrackingEvent", self.onFaceTracking, false);
        }
        else if(e.status === "redetecting"){
          window.addEventListener('mousemove', self.onMouseMove);
          document.removeEventListener("facetrackingEvent", self.onFaceTracking, false);
        }
      });
  };

  Parallax.prototype.initialise = function() {

    // Configure Context Styles
    if (this.transform3DSupport) this.accelerate(this.element);
    var style = window.getComputedStyle(this.element);
    if (style.getPropertyValue('position') === 'static') {
      this.element.style.position = 'relative';
    }

    // Configure Layer Styles
    for (var i = 0, l = this.layers.length; i < l; i++) {
      var layer = this.layers[i];
      if (this.transform3DSupport) this.accelerate(layer);
      layer.style.position = i ? 'absolute' : 'relative';
      layer.style.display = 'block';
      layer.style.height = '100%';
      layer.style.width = '100%';
      layer.style.left = 0;
      layer.style.top = 0;

      // Cache Layer Depth
      this.depths.push(this.data(layer, 'depth') || 0);
    }

    // Setup
    if(this.headtrackr === true){
        this.launchHeadtrackr();
    }
    this.updateDimensions();
    this.enable();
    this.queueCalibration(this.calibrationDelay);
  };

  Parallax.prototype.updateDimensions = function() {

    // Cache Context Dimensions
    this.ox = this.offset(this.element).left;
    this.oy = this.offset(this.element).top;
    this.ow = this.element.offsetWidth;
    this.oh = this.element.offsetHeight;

    // Cache Window Dimensions
    this.ww = window.innerWidth;
    this.wh = window.innerHeight;
    this.hw = this.ww / 2;
    this.hh = this.wh / 2;
  };

  Parallax.prototype.queueCalibration = function(delay) {
    clearTimeout(this.calibrationTimer);
    this.calibrationTimer = setTimeout(this.onCalibrationTimer, delay);
  };

  Parallax.prototype.enable = function() {
    if (!this.enabled) {
      this.enabled = true;
      if (this.headtrackr === false && this.orientationSupport) {
        this.portrait = null;
        window.addEventListener('deviceorientation', this.onDeviceOrientation);
        setTimeout(this.onOrientationTimer, this.supportDelay);
      } else {
        this.cx = 0;
        this.cy = 0;
        this.portrait = false;
        if(!this.htrackr){
          window.addEventListener('mousemove', this.onMouseMove);
        }
        else{
          document.addEventListener("facetrackingEvent", this.onFaceTracking, false);
        }
      }
      window.addEventListener('resize', this.onWindowResize);
      this.raf = requestAnimationFrame(this.onAnimationFrame);
    }
  };

  Parallax.prototype.disable = function() {
    if (this.enabled) {
      this.enabled = false;
      if (this.headtrackr === false && this.orientationSupport) {
        window.removeEventListener('deviceorientation', this.onDeviceOrientation);
      } else {
        if(!this.htrackr){
          window.removeEventListener('mousemove', this.onMouseMove);
        }
        else{
          document.removeEventListener("facetrackingEvent", this.onFaceTracking, false);
        }
      }
      window.removeEventListener('resize', this.onWindowResize);
      cancelAnimationFrame(this.raf);
    }
  };

  Parallax.prototype.calibrate = function(x, y) {
    this.calibrateX = x === undefined ? this.calibrateX : x;
    this.calibrateY = y === undefined ? this.calibrateY : y;
  };

  Parallax.prototype.invert = function(x, y) {
    this.invertX = x === undefined ? this.invertX : x;
    this.invertY = y === undefined ? this.invertY : y;
  };

  Parallax.prototype.friction = function(x, y) {
    this.frictionX = x === undefined ? this.frictionX : x;
    this.frictionY = y === undefined ? this.frictionY : y;
  };

  Parallax.prototype.scalar = function(x, y) {
    this.scalarX = x === undefined ? this.scalarX : x;
    this.scalarY = y === undefined ? this.scalarY : y;
  };

  Parallax.prototype.limit = function(x, y) {
    this.limitX = x === undefined ? this.limitX : x;
    this.limitY = y === undefined ? this.limitY : y;
  };

  Parallax.prototype.clamp = function(value, min, max) {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
  };

  Parallax.prototype.css = function(element, property, value) {
    var jsProperty = null;
    for (var i = 0, l = this.vendors.length; i < l; i++) {
      if (this.vendors[i] !== null) {
        jsProperty = this.camelCase(this.vendors[i][1] + '-' + property);
      } else {
        jsProperty = property;
      }
      if (element.style[jsProperty] !== undefined) {
        element.style[jsProperty] = value;
        break;
      }
    }
  };

  Parallax.prototype.accelerate = function(element) {
    this.css(element, 'transform', 'translate3d(0,0,0)');
    this.css(element, 'transform-style', 'preserve-3d');
    this.css(element, 'backface-visibility', 'hidden');
  };

  Parallax.prototype.setPosition = function(element, x, y) {
    x += '%';
    y += '%';
    if (this.transform3DSupport) {
      this.css(element, 'transform', 'translate3d('+x+','+y+',0)');
    } else if (this.transform2DSupport) {
      this.css(element, 'transform', 'translate('+x+','+y+')');
    } else {
      element.style.left = x;
      element.style.top = y;
    }
  };

  Parallax.prototype.onOrientationTimer = function(event) {
    if (this.orientationSupport && this.orientationStatus === 0) {
      this.disable();
      this.orientationSupport = false;
      this.enable();
    }
  };

  Parallax.prototype.onCalibrationTimer = function(event) {
    this.calibrationFlag = true;
  };

  Parallax.prototype.onWindowResize = function(event) {
    this.updateDimensions();
  };

  Parallax.prototype.onAnimationFrame = function() {
    var dx = this.ix - this.cx;
    var dy = this.iy - this.cy;
    if ((Math.abs(dx) > this.calibrationThreshold) || (Math.abs(dy) > this.calibrationThreshold)) {
      this.queueCalibration(0);
    }
    if (this.portrait) {
      this.mx = (this.calibrateX ? dy : this.iy) * this.scalarX;
      this.my = (this.calibrateY ? dx : this.ix) * this.scalarY;
    } else {
      this.mx = (this.calibrateX ? dx : this.ix) * this.scalarX;
      this.my = (this.calibrateY ? dy : this.iy) * this.scalarY;
    }
    if (!isNaN(parseFloat(this.limitX))) {
      this.mx = this.clamp(this.mx, -this.limitX, this.limitX);
    }
    if (!isNaN(parseFloat(this.limitY))) {
      this.my = this.clamp(this.my, -this.limitY, this.limitY);
    }
    this.vx += (this.mx - this.vx) * this.frictionX;
    this.vy += (this.my - this.vy) * this.frictionY;
    for (var i = 0, l = this.layers.length; i < l; i++) {
      var layer = this.layers[i];
      var depth = this.depths[i];
      var xOffset = this.vx * depth * (this.invertX ? -1 : 1);
      var yOffset = this.vy * depth * (this.invertY ? -1 : 1);
      this.setPosition(layer, xOffset, yOffset);
    }
    this.raf = requestAnimationFrame(this.onAnimationFrame);
  };

  Parallax.prototype.onDeviceOrientation = function(event) {

    // Validate environment and event properties.
    if (!this.desktop && event.beta !== null && event.gamma !== null) {

      // Set orientation status.
      this.orientationStatus = 1;

      // Extract Rotation
      var x = (event.beta  || 0) / MAGIC_NUMBER; //  -90 :: 90
      var y = (event.gamma || 0) / MAGIC_NUMBER; // -180 :: 180

      // Detect Orientation Change
      var portrait = this.wh > this.ww;
      if (this.portrait !== portrait) {
        this.portrait = portrait;
        this.calibrationFlag = true;
      }

      // Set Calibration
      if (this.calibrationFlag) {
        this.calibrationFlag = false;
        this.cx = x;
        this.cy = y;
      }

      // Set Input
      this.ix = x;
      this.iy = y;
    }
  };

  Parallax.prototype.onMouseMove = function(event) {

    // Calculate Input
    this.ix = (event.pageX - this.hw) / this.hw;
    this.iy = (event.pageY - this.hh) / this.hh;
  };
  
  Parallax.prototype.onFaceTracking = function(event) {
    
    // Calculate Input
    if(event.detection === "CS"){
      this.ix = -this.headtrackrScalarX*(event.x - this.htrackr.canvasInputInfos.hw) / this.htrackr.canvasInputInfos.hw;
      this.iy = this.headtrackrScalarY*(event.y - this.htrackr.canvasInputInfos.hh) / this.htrackr.canvasInputInfos.hh;
      if(this.headtrackrDebugView === true){
        this.htrackr.canvasDebug.width = this.htrackr.canvasDebug.width;
        this.htrackr.ctxDebug.translate(event.x, event.y)
        this.htrackr.ctxDebug.rotate(event.angle-(Math.PI/2));
        this.htrackr.ctxDebug.strokeStyle = "#00CC00";
        this.htrackr.ctxDebug.strokeRect((-(event.width/2)) >> 0, (-(event.height/2)) >> 0, event.width, event.height);
        this.htrackr.ctxDebug.rotate((Math.PI/2)-event.angle);
        this.htrackr.ctxDebug.translate(-event.x, -event.y);
      }
    }
      
  };

  // Expose Parallax
  window[NAME] = Parallax;

})(window, document);
