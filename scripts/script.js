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
const Animation = require('Animation');
const CameraInfoModule = require('CameraInfo/index.js');
const Audio = require('Audio');

// import { cameraTransformToFocalDistance } from './Screen.js';
// Use export keyword to make a symbol available in scripting debug console


// Enables async/await in JS [part 1]
(async function() {
    const tear = await Scene.root.findFirst('tear');
    const camera = await mainCamera;
    const face = FaceTracking.face(0);
    const feature = face.cameraTransform.applyToPoint(face.leftEye.center);
    var myFace = await Scene.root.findFirst('face');
    const audioClip = await Audio.getAudioPlaybackController('audioPlaybackController');
    const worldPosEye = await Screen.cameraTransformToFocalPlane(feature);
    const canvasPosEye = await Screen.focalPlaneToCanvas(worldPosEye);
    const screenSize = await Screen.getFullscreenSize();
    const speaker = await Scene.root.findFirst('speaker0');

    // Ambient Lighting
    const [ambientLight, pinkLight, greenLight] = await Promise.all([
        Scene.root.findFirst('ambientLight0'),
        Scene.root.findFirst('pink'),
        Scene.root.findFirst('greem')
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

    // Create a sampler with a quadratic change in and out from -5 to 5
    const quadraticSampler = Animation.samplers.easeInOutQuad(0.1, .43);
    const linearSample = Animation.samplers.linear(0.1, 1);
    /////////////////////////
    // Interactive example //
    /////////////////////////
    // const mouthOpennessDriver = Animation.valueDriver(mouthOpenness, .1, .6);
    // const scaleAnimation = Animation.animate(mouthOpennessDriver, quadraticSampler);
    // const scaleAnimationPos = Animation.animate(mouthOpennessDriver, linearSample);

    /////////////////////////
    // Static example //
    /////////////////////////
    // Create a time driver using the parameters
    const timeDriver = Animation.timeDriver(timeDriverParameters);
    const timeDriverLighting = Animation.timeDriver(timeDriverParameters);
    const scaleAnimation = Animation.animate(timeDriver, quadraticSampler);
    const scaleAnimationPos = Animation.animate(timeDriver, linearSample);
    const lightingFade = Animation.animate(timeDriverLighting, linearSample);

    const myFaceTransformation = Reactive.pack3(
        worldPosEye.x.neg().mul(scaleAnimationPos),
        worldPosEye.y.neg().mul(scaleAnimationPos),
        scaleAnimation
    )

    myFace.transform.position = myFaceTransformation
    // tear.transform.position = myFaceTransformation

    FaceGestures.onShake(face).subscribe(() => {
        timeDriver.start();
      });
    
    // Bind the light intensity to the intensity of the ambient light
    var isAudioPlaying = false;
    timeDriver.onCompleted().subscribe(() => {
        // Start or stop the audio depending on the state of the boolean
        audioClip.setPlaying(true);
        speaker.volume = 1;
        ambientLight.intensity = lightingFade;
        pinkLight.intensity = lightingFade;
        pinkLight.intensity = lightingFade;

        timeDriverLighting.start();
    })

    ambientLight.intensity = Reactive.smoothStep(scaleAnimationPos.neg().add(1), .2, 1);
    // speaker.volume = scaleAnimationPos;

    // Scale face
    // myFace.transform.scale = Reactive.pack2(SCALE, SCALE);

    // var faceMat = await Materials.findFirst('material1');
    
    // myCanvas.material = cameraTex;
    // myPlane.material = cameraTex;
    // myPlane.diffuse = cameraTex;
    // myCanvas.diffuse = cameraTex;

    // (await faceMat.diffuseTextureTransform).offsetU = 1;
    // faceMat.diffuseTextureTransform.offsetV = 10;
    // await (faceMat.diffuseTextureTransform).offsetV(1);
    /**
    // Materials.get(`noise`).setTexture(tempVec4, {textureSlotName: "diffuseTexture"});
    const face = FaceTracking.face(0);
    const eyePos = face.cameraTransform.applyToPoint(face.leftEye.center);
    const eyeClose = FaceTracking.face(0).rightEye.openness;

    // Diagnostics.log(eyePos);
    const pos = await Screen.cameraTransformToFocalDistance(eyePos);
    const percentToFocalPlane = await Screen.cameraTransformToFocalPlane(eyePos);

    Diagnostics.watch('x', eyePos.x);
    Diagnostics.watch('y', eyePos.y);
    myPlane.transform.position = await Screen.cameraTransformToFocalDistance(eyePos);


    // myCanvas.worldTransform.position = ();
    // Diagnostics.watch("Mouth Openness - ", eyePos);
    // Get signal for person's eye
    // Bind position of it 
    // Detect when right eye close
    // Bind signal for closed eye to transform scale & position


// To use variables and functions across files, use export/import keyword
// export const animationDuration = 10;

// Use import keyword to import a symbol from another file
// import { animationDuration } from './script.js'

// To access scene objects
// const [directionalLight] = await Promise.all([
//   Scene.root.findFirst('directionalLight0')
// ]);

// To access class properties
// const directionalLightIntensity = directionalLight.intensity;

// To log messages to the console
// Diagnostics.log('Console message logged from the script.');

// Enables async/await in JS [part 2]
 **/
})();
