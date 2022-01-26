/**
 * @author Marius Lenzing
 * Display font only by drawing shapes surrounding the font without collisions.
 *
 * thanks to Ben Moren (p5.collide2d.js)
 */

let font;
let fontSize = 200;
let textOffsetX = 50;
let textOffsetY = 400;
let word = "test";

let numberOfShapes = 100;
let shapeMinSize = 1;
let shapeMaxSize = 30;
let shapeColor = "white";
let shapeColorMode = "single";
let ishiharaColorsGreen = ["#9fae59", "#59732a", "#4a5a1b", "#417b6f", "#78a175"];
let ishiharaColorsRed = ["#ba9f58", "#b28449", "#a46c33"];
let shapeGradientMode = "no";
let parallaxMode = "big shapes in front";
let shapeTypes = ["circle", "square", "triangle_equilateral", "triangle_equilateral-upsidedown", "triangle_random"];

let backgroundColor = "black";

let allBackgroundShapes;
let textPolygon;
let textBoundaryCircles;

let inputs = {};
let shapesArePrepared = false;


let debugModeFontIsOn = false;
let debugModeFpsIsOn = false;

let numberOfFramesSinceLastSecond = 0;
let timestampOfLastSecond = null;
let framesPerSecond = "";

/**
 * P5.js Method
 */
function preload() {
  font = loadFont('assets/AssembledFromScratch-2wW3.ttf');
}

/**
 * P5.js Method
 */
function setup() {
  createInputs();
}

/**
 * create Inputs to adjust draw-settings
 */
function createInputs() {
  createSpan("SETTINGS: <br/><br/>");

  createSpan('Word: ');
  inputs.word = createInput("test");
  createSpan('<br/><br/>');

  createSpan('Font-size: ');
  inputs.fontSize = createInput("200");
  createSpan('px <br/>');

  createSpan('Text Offset X: ');
  inputs.textOffsetX = createInput("50");
  createSpan('px <br/>');

  createSpan('Text Offset Y: ');
  inputs.textOffsetY = createInput("400");
  createSpan('px <br/><br/>');

  createSpan('Shape Types: ');
  inputs.shapeTypeCircle = createCheckbox("Circle");
  inputs.shapeTypeSquare = createCheckbox("Square");
  inputs.shapeTypeTriangle1 = createCheckbox("Triangle (equilateral)");
  inputs.shapeTypeTriangle2 = createCheckbox("Triangle (equilateral-upsidedown)");
  inputs.shapeTypeTriangle3 = createCheckbox("Triangle (Random)", true);

  createSpan('<br/>Number of Shapes: ');
  inputs.numberOfShapes = createInput("1000");
  createSpan('<br/>');

  createSpan('<br/>min-size of Shapes: ');
  inputs.shapeMinSize = createInput("2");
  createSpan('px <br/>');

  createSpan('max-size of Shapes: ');
  inputs.shapeMaxSize = createInput("30");
  createSpan('px <br/><br/>');

  createSpan('Color of Shapes (single color mode): <br/>');
  inputs.shapeColor = createColorPicker("#FF0000");

  createSpan('<br/><br/>Color Mode: ');
  inputs.shapeColorMode = createRadio("colorMode");
  inputs.shapeColorMode.option('single');
  inputs.shapeColorMode.option('random');
  inputs.shapeColorMode.option("disco", 'Disco! (not for epileptics)');
  inputs.shapeColorMode.option("ishihara", 'Ishihara-test (red-green color deficiencies)');
  inputs.shapeColorMode.selected('single');

  createSpan('<br/>lower shapeColor-alpha-value depending on shape size: ');
  inputs.shapeGradientMode = createRadio("gradientMode");
  inputs.shapeGradientMode.option('no');
  inputs.shapeGradientMode.option('yes, reversed', "transparent big shapes");
  inputs.shapeGradientMode.option('yes', "transparent small shapes");
  inputs.shapeGradientMode.selected('no');

  createSpan('<br/>Parallax Mode: ');
  inputs.parallaxMode = createRadio("parallaxMode");
  inputs.parallaxMode.option('no');
  inputs.parallaxMode.option('big shapes in front');
  inputs.parallaxMode.option('small shapes in front');
  inputs.parallaxMode.selected('big shapes in front');
  createSpan('(press and move mouse to move shapes)');

  createSpan('<br/><br/>Background Color: <br/>');
  inputs.backgroundColor = createColorPicker("#000000");

  createSpan('<br/><br/>Debug Modes:');
  inputs.debugModeFont = createCheckbox("show text-shape");
  inputs.debugModeFps = createCheckbox("Show FPS");
  createSpan('<br/>');

  let submitButton = createButton("draw!");

  submitButton.mousePressed(function () {
    getInputData();
    prepareShapes();
    createCanvas(windowWidth, windowHeight);
  });
  createSpan('<br/><br/><br/>');
}

/**
 * get Input Data from Inputs
 */
function getInputData() {
  word = inputs.word.value();
  fontSize = parseInt(inputs.fontSize.value());
  textOffsetX = parseInt(inputs.textOffsetX.value());
  textOffsetY = parseInt(inputs.textOffsetY.value());

  shapeTypes = [];
  if (inputs.shapeTypeCircle.checked()) {
    shapeTypes.push("circle");
  }
  if (inputs.shapeTypeSquare.checked()) {
    shapeTypes.push("square");
  }
  if (inputs.shapeTypeTriangle1.checked()) {
    shapeTypes.push("triangle_equilateral");
  }
  if (inputs.shapeTypeTriangle2.checked()) {
    shapeTypes.push("triangle_equilateral-upsidedown");
  }
  if (inputs.shapeTypeTriangle3.checked()) {
    shapeTypes.push("triangle_random");
  }

  numberOfShapes = parseInt(inputs.numberOfShapes.value());
  shapeMinSize = parseInt(inputs.shapeMinSize.value());
  shapeMaxSize = parseInt(inputs.shapeMaxSize.value());

  shapeColor = inputs.shapeColor.value();
  shapeColorMode = inputs.shapeColorMode.value();
  shapeGradientMode = inputs.shapeGradientMode.value();
  parallaxMode = inputs.parallaxMode.value();
  backgroundColor = inputs.backgroundColor.value();

  debugModeFontIsOn = inputs.debugModeFont.checked();
  debugModeFpsIsOn = inputs.debugModeFps.checked();
}

/**
 * compute position of TextPolygon and background-Shapes
 */
function prepareShapes() {
  textSize(fontSize);
  textFont(font);

  textPolygon = new TextPloygon(word, textOffsetX, textOffsetY, fontSize);
  textBoundaryCircles = textPolygon.boundaryCircles;

  allBackgroundShapes = [];

  for (let i = 0; i < numberOfShapes; i++) {
    let newShape;
    let numberOfTriesLeft = 200;

    if (shapeColorMode === "ishihara") {
      do {
        newShape = createNewShape();
        numberOfTriesLeft--;
      }
      while (
          newShape.collidesWithOtherShapes(allBackgroundShapes, textBoundaryCircles)
          && numberOfTriesLeft > 0
      );

      if (textPolygon.collidesWithShape(newShape)) {
        newShape.setColor(
            random(ishiharaColorsRed)
        );
      }
      else{
        newShape.setColor(
            random(ishiharaColorsGreen)
        );
      }
    }
    else {

      do {
        newShape = createNewShape();
        numberOfTriesLeft--;
      }
      while (
          (
              newShape.collidesWithOtherShapes(allBackgroundShapes)
              || textPolygon.collidesWithShape(newShape)
          )
          && numberOfTriesLeft > 0
      );
    }

    if (numberOfTriesLeft === 0) {
      console.log("break! - Kein Platz mehr bei " + allBackgroundShapes.length + " shapes.");
      break;
    }

    if (shapeColorMode === "single") {
      newShape.setColor(shapeColor);
    }

    if (shapeColorMode === "random") {
      let r = random(0, 255);
      let g = random(0, 255);
      let b = random(0, 255);
      let shapeColor = color(r, g, b);
      newShape.setColor(shapeColor);
    }

    allBackgroundShapes.push(newShape);
  }

  if (parallaxMode === "big shapes in front") {
    allBackgroundShapes.sort(function(shape1, shape2) {
      return shape1.size - shape2.size;
    });
  }
  if (parallaxMode === "small shapes in front") {
    allBackgroundShapes.sort(function(shape1, shape2) {
      return shape2.size - shape1.size;
    });
  }

  shapesArePrepared = true;
}

/**
 * creates new shape according to settings made
 * @return {*}
 */
function createNewShape() {
  let newShape;

  let newShapeType = random(shapeTypes);

  switch (newShapeType) {
    case "circle":
      newShape = new Circle(
          random(shapeMinSize, shapeMaxSize)
      );
      break;

    case "square":
      let size = random(shapeMinSize, shapeMaxSize)
      newShape = new Rectangle(size, size);
      break;

    case "triangle_equilateral":
      newShape = new Triangle("equilateral", random(shapeMinSize, shapeMaxSize));
      break;

    case "triangle_equilateral-upsidedown":
      newShape = new Triangle("equilateral-upsidedown", random(shapeMinSize, shapeMaxSize));
      break;

    case "triangle_random":
      newShape = new Triangle("random", random(shapeMinSize, shapeMaxSize));
      break;

    default:
      newShape = new Circle();
  }

  return newShape;
}

/**
 * P5.js Method
 */
function draw() {

  if (shapesArePrepared) {
    drawImage();

    if (debugModeFpsIsOn) {
      displayFps();
    }
  }
}

/**
 * Render background-shapes and text
 */
function drawImage() {
  noStroke();
  background(backgroundColor);

  let drawOffsetX, drawOffsetY = 0;

  if(mouseIsPressed) {
    // map mousePosition to coordinate System where center of canvas is (0;0)
    drawOffsetX = map(mouseX, 0, windowWidth, -windowWidth / 8, windowWidth / 8);
    drawOffsetY = map(mouseY, 0, windowHeight, -windowHeight / 8, windowHeight / 8);
  }

  for (let i = 0; i < allBackgroundShapes.length; i++) {
    let thisShape = allBackgroundShapes[i];

    let thisColor = thisShape.color;

    if (shapeColorMode === "disco") {
      let r = random(0, 255);
      let g = random(0, 255);
      let b = random(0, 255);
      thisColor = color(r, g, b);
    }

    if (shapeGradientMode === "yes") {
      let newAlpha = map(thisShape.size, shapeMinSize, shapeMaxSize, 50, 255);
      thisColor.setAlpha(newAlpha);
    }

    if (shapeGradientMode === "yes, reversed") {
      let newAlpha = map(thisShape.size, shapeMinSize, shapeMaxSize, 255, 50);
      thisColor.setAlpha(newAlpha);
    }

    let thisParallaxModifier = 1;

    if (parallaxMode === "big shapes in front") {
      thisParallaxModifier = map(thisShape.size, shapeMinSize, shapeMaxSize, 0.1, 1);
    }
    if (parallaxMode === "small shapes in front") {
      thisParallaxModifier = map(thisShape.size, shapeMinSize, shapeMaxSize, 1, 0.1);
    }

    thisShape.draw(
        thisColor,
        drawOffsetX * thisParallaxModifier,
        drawOffsetY * thisParallaxModifier
    );
  }

  if(debugModeFontIsOn) {
    fill(color(232, 201, 23, 100));
    textPolygon.drawShape();

    fill("green");
    textPolygon.drawCirclesOnBoundary();
  }
  else {
    // fill(backgroundColor);
    // textPolygon.drawText();
  }
}

function displayFps() {
  let currentTimestamp = new Date().getTime();

  if (!timestampOfLastSecond) {
    timestampOfLastSecond = currentTimestamp;
  }

  numberOfFramesSinceLastSecond++;

  let oneSecondHasPassed = (currentTimestamp - timestampOfLastSecond) > 1000;

  if (oneSecondHasPassed) {
    framesPerSecond = numberOfFramesSinceLastSecond;

    timestampOfLastSecond = currentTimestamp;
    numberOfFramesSinceLastSecond = 0;
  }

  textSize(25);
  fill("green");
  stroke("white");
  strokeWeight(2);
  text(framesPerSecond, 10, 30);
}
