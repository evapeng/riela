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
const FaceTracking = require('FaceTracking');
const Diagnostics = require('Diagnostics');
const Textures = require('Textures');
const Materials = require('Materials');
Diagnostics.log('Console message logged from the script.');
const Screen = require('./Screen.js');
const mainCamera = Scene.root.findFirst('Camera');
const Animation = require('Animation');

// import { cameraTransformToFocalDistance } from './Screen.js';
// Use export keyword to make a symbol available in scripting debug console


// Enables async/await in JS [part 1]
(async function() {
    const tear = await Scene.root.findFirst('tear');

    const face = FaceTracking.face(0);
    const feature = face.cameraTransform.applyToPoint(face.leftEye.center);
    var myFace = await Scene.root.findFirst('face');

    const worldPosEye = await Screen.cameraTransformToFocalPlane(feature);
    const canvasPosEye = await Screen.focalPlaneToCanvas(worldPosEye);
    const screenSize = await Screen.getFullscreenSize();
    const SCALE = 1;

    // For 2D Canvas World
    // const myFaceTransformation = Reactive.pack3(
    //     canvasPosEye.x.neg().mul(SCALE).add(Screen.width.mul(SCALE).div(Screen.screenScale).div(2)),
    //     canvasPosEye.y.neg().mul(SCALE).add(Screen.height.mul(SCALE).div(Screen.screenScale).div(2)),
    //     0
    // )

    //==============================================================================
    // Animate the plane's horizontal position continuously
    //==============================================================================

    // Create a set of time driver parameters
    const timeDriverParameters = {
        // The duration of the driver
        durationMilliseconds: 1500,

        // The number of iterations before the driver stops
        loopCount: Infinity,

        // Should the driver 'yoyo' back and forth
        mirror: true
    };

    // Create a time driver using the parameters
    const timeDriver = Animation.timeDriver(timeDriverParameters);

    // Create a sampler with a quadratic change in and out from -5 to 5
    const quadraticSamplerNormalized = Animation.samplers.easeInOutQuad(0, 1);
    const quadraticSampler = Animation.samplers.easeInOutQuad(0, .6);
    // const quadraticSamplerFaceX = Animation.samplers.easeInOutQuad(0, worldPosEye.x.neg().pinLastValue());
    // const quadraticSamplerFaceY = Animation.samplers.easeInOutQuad(0, worldPosEye.y.neg().pinLastValue());

    // Create an animation combining the driver and sampler
    const translationAnimation = Animation.animate(timeDriver, quadraticSampler);
    const translationAnimationNormalized = Animation.animate(timeDriver, quadraticSamplerNormalized);

    // Bind the translation animation signal to the x-axis position signal of the plane
    // For 3D World
    const myFaceTransformation = Reactive.pack3(
        worldPosEye.x.neg().mul(translationAnimationNormalized),
        worldPosEye.x.neg().mul(translationAnimationNormalized),
        translationAnimation
    )

    myFace.transform.position = myFaceTransformation
    tear.transform.position = myFaceTransformation

    timeDriver.start();


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
