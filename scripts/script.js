/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in modules
const Scene = require('Scene');
const Reactive = require('Reactive');
const FaceGestures = require('FaceGestures');
const FaceTracking = require('FaceTracking');
const Diagnostics = require('Diagnostics');
const Textures = require('Textures');
const Materials = require('Materials');
Diagnostics.log('Console message logged from the script.');
const Screen = require('./Screen.js');
const mainCamera = Scene.root.findFirst('Camera');
const tear = Scene.root.findFirst('tear');
const Animation = require('Animation');
const CameraInfoModule = require('CameraInfo/index.js');
const Audio = require('Audio');

// import { cameraTransformToFocalDistance } from './Screen.js';
// Use export keyword to make a symbol available in scripting debug console


// Enables async/await in JS [part 1]
(async function() {
    const tear = await Scene.root.findFirst('tear');
    const tearLeft = await Scene.root.findFirst('tearL');
    const camera = await mainCamera;
    const face = FaceTracking.face(0);
    const leftEye = face.cameraTransform.applyToPoint(face.leftEye.center);
    const rightEye = face.cameraTransform.applyToPoint(face.rightEye.center);
    var myFace = await Scene.root.findFirst('face');
    const audioController = await Audio.getAudioPlaybackController('audioPlaybackController');
    const worldPosEye = await Screen.cameraTransformToFocalPlane(leftEye);

    const worldPosRightEye = await Screen.cameraTransformToFocalPlane(rightEye);
    const canvasPosRightEye = await Screen.focalPlaneToCanvas(worldPosRightEye);
    const canvasPosEye = await Screen.focalPlaneToCanvas(worldPosEye);
    const screenSize = await Screen.getFullscreenSize();
    const speaker = await Scene.root.findFirst('speaker0');
    const cube = await Scene.root.findFirst('Cube');

    // Ambient Lighting
    const [ambientLight, pinkLight, greenLight, stars] = await Promise.all([
        Scene.root.findFirst('ambientLight0'),
        Scene.root.findFirst('pink'),
        Scene.root.findFirst('greem'),
        Scene.root.findFirst('emitterStars')
    ]);

    // For 2D Canvas World
    // const myFaceTransformation = Reactive.pack3(
    //     canvasPosEye.x.neg().mul(SCALE).add(Screen.width.mul(SCALE).div(Screen.screenScale).div(2)),
    //     canvasPosEye.y.neg().mul(SCALE).add(Screen.height.mul(SCALE).div(Screen.screenScale).div(2)),
    //     0
    // )

    //==============================================================================
    // Animate the plane's horizontal position continuously
    //==============================================================================
    // const mouthOpenness = FaceTracking.face(0).mouth.openness;

    // Create a set of time driver parameters
    const timeDriverParameters = {
        // The duration of the driver
        durationMilliseconds: 3000,

        // The number of iterations before the driver stops
        loopCount: 1,

        // Should the driver 'yoyo' back and forth
        mirror: false,
    };

    const audioDriverParameters = {
        // The duration of the driver
        durationMilliseconds: 6000,

        // The number of iterations before the driver stops
        loopCount: 1,

        // Should the driver 'yoyo' back and forth
        mirror: false,
    };

    // Create a sampler with a quadratic change in and out from -5 to 5
    const quadraticSampler = Animation.samplers.easeInOutQuad(0.1, .53);
    const cubeSampler = Animation.samplers.easeInOutQuad(-2.0, -1.3628);
    const linearSample = Animation.samplers.linear(0, 1);
    /////////////////////////
    // Interactive example //
    /////////////////////////
    // const mouthOpennessDriver = Animation.valueDriver(mouthOpenness, .1, .6);
    // const scaleAnimation = Animation.animate(mouthOpennessDriver, quadraticSampler);
    // const posAnimation = Animation.animate(mouthOpennessDriver, linearSample);

    /////////////////////////
    // Static example //
    /////////////////////////
    // Create a time driver using the parameters
    const timeDriver = Animation.timeDriver(timeDriverParameters);
    const audioDriver = Animation.timeDriver(audioDriverParameters);
    const timeDriverLighting = Animation.timeDriver(timeDriverParameters);
    const scaleAnimation = Animation.animate(timeDriver, quadraticSampler);
    const cubeAnimation = Animation.animate(timeDriver, cubeSampler);
    const posAnimation = Animation.animate(timeDriver, linearSample);
    const audioFade = Animation.animate(audioDriver, linearSample);
    const lightingFade = Animation.animate(timeDriver, linearSample);

    const centerEyeTransform = worldPosEye.neg().mul(posAnimation);

    const myFaceTransformation = Reactive.pack3(
        centerEyeTransform.x,
        centerEyeTransform.y,
        scaleAnimation
    )
    
    const myTearTransformation = myFaceTransformation.add(worldPosRightEye).add(Reactive.pack3(0,0,0.03));
    const myTearLeftTransformation = myFaceTransformation.add(worldPosEye).add(Reactive.pack3(0,0,0.03));

    myFace.transform.position = myFaceTransformation
    tear.transform.position = myTearTransformation
    tearLeft.transform.position = myTearLeftTransformation;
    tear.transform.rotation = face.cameraTransform.rotation;
    cube.transform.z = cubeAnimation;
    
    speaker.volume = audioFade;
    FaceGestures.onShake(face).subscribe(() => {
        timeDriver.start();
        audioController.setPlaying(true);
        audioDriver.start();
        audioController.setLooping(true);
      });
    
    // Bind the light intensity to the intensity of the ambient light
    // var isAudioPlaying = false;
      
    
    timeDriver.onCompleted().subscribe(() => {
        // Start or stop the audio depending on the state of the boolean
        ambientLight.intensity = lightingFade;
        pinkLight.intensity = lightingFade;
        pinkLight.intensity = lightingFade;
        stars.hidden = false;
        ambientLight.color = Reactive.RGBA(1, .9, .55, lightingFade);

        timeDriverLighting.start();
    })

    ambientLight.intensity = Reactive.smoothStep(posAnimation.neg().add(1), .2, 1);
    // speaker.volume = posAnimation;
})();
