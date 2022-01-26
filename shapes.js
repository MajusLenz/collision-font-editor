/**
 * object-oriented classes to use the p5.collide2d.js library for some basic P5-shapes
 * @author Marius Lenzing
 */


/**
 * Abstract Class to represent a 2D-Shape
 */
class Shape {

  getClassName() {
    return this.__proto__.constructor.name;
  }

  setColor(newColor) {
    this.color = color(newColor);
  }

  constructor() {
    this.color = null;
  }

  /**
   * tells if shape has collision with otherShape
   * @param otherShape Shape
   * @returns {boolean}
   */
  collidesWith(otherShape) {
    let collisionType = this.getClassName() + otherShape.getClassName();

    let vectorsTriangle1 = [];
    let vectorsTriangle2 = [];
    let vectorsRectangle1 = [];
    let vectorsRectangle2 = [];

    if(this.getClassName() === "Triangle") {
      vectorsTriangle1 = [
        createVector(this.x1, this.y1),
        createVector(this.x2, this.y2),
        createVector(this.x3, this.y3)
      ];
    }
    if(otherShape.getClassName() === "Triangle") {
      vectorsTriangle2 = [
        createVector(otherShape.x1, otherShape.y1),
        createVector(otherShape.x2, otherShape.y2),
        createVector(otherShape.x3, otherShape.y3)
      ];
    }

    if(this.getClassName() === "Rectangle") {
      vectorsRectangle1 = [
        createVector(this.x, this.y),
        createVector(this.x + this.w, this.y),
        createVector(this.x + this.w, this.y + this.h),
        createVector(this.x, this.y + this.h)
      ];
    }
    if(otherShape.getClassName() === "Rectangle") {
      vectorsRectangle2 = [
        createVector(otherShape.x, otherShape.y),
        createVector(otherShape.x + otherShape.w, otherShape.y),
        createVector(otherShape.x + otherShape.w, otherShape.y + otherShape.h),
        createVector(otherShape.x, otherShape.y + otherShape.h)
      ];
    }

    switch(collisionType) {
      case "CircleCircle":
        return collideCircleCircle(
          this.x, this.y, this.diameter,
          otherShape.x, otherShape.y, otherShape.diameter
        );

      case "RectangleRectangle":
        return collideRectRect(
          this.x, this.y, this.w, this.h,
          otherShape.x, otherShape.y, otherShape.w, otherShape.h
        );

      case "TriangleTriangle":
        return collidePolyPoly(
            vectorsTriangle1,
            vectorsTriangle2,
            true
        );

      case "RectangleCircle":
        return collideRectCircle(
            this.x, this.y, this.w, this.h,
            otherShape.x, otherShape.y, otherShape.diameter
        );
      case "CircleRectangle":
        return collideRectCircle(
            otherShape.x, otherShape.y, otherShape.w, otherShape.h,
            this.x, this.y, this.diameter
        );

      case "RectangleTriangle":
        return collidePolyPoly(
            vectorsRectangle1,
            vectorsTriangle2,
            true
        );
      case "TriangleRectangle":
        return collidePolyPoly(
            vectorsTriangle1,
            vectorsRectangle2,
            true
        );

      case "CircleTriangle":
        return collideCirclePoly(
            this.x, this.y, this.diameter,
            vectorsTriangle2,
            true
        );
      case "TriangleCircle":
        return collideCirclePoly(
            otherShape.x, otherShape.y, otherShape.diameter,
            vectorsTriangle1,
            true
        );
    }

    return false;
  }

  /**
   * tells if shape has collision with any other shape in shapesArray or secondShapesArray
   * @param shapesArray
   * @param secondShapesArray
   * @returns {boolean}
   */
  collidesWithOtherShapes(shapesArray, secondShapesArray) {
    for (let i = 0; i < shapesArray.length; i++) {
      if (this.collidesWith(shapesArray[i])) {
        return true;
      }
    }
    if(!secondShapesArray) {
      return false;
    }

    for (let i = 0; i < secondShapesArray.length; i++) {
      if (this.collidesWith(secondShapesArray[i])) {
        return true;
      }
    }

    return false;
  }
}

/**
 * class to represent a 2D-Circle
 */
class Circle extends Shape {
  constructor(diameter, x, y) {
    super();

    if(!x) {
      x = random(0, windowWidth);
    }
    if(!y) {
      y = random(0, windowHeight);
    }
    if(!diameter) {
      diameter = random(1, 30);
    }

    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.size = diameter;
  }

  draw(color, offsetX, offsetY) {
    if (color) {
      fill(color);
    }
    if (!offsetX) {
      offsetX = 0;
    }
    if (!offsetX) {
      offsetY = 0;
    }

    circle(
        this.x + offsetX,
        this.y + offsetY,
        this.diameter
    );
  }
}

/**
 * class to represent a 2D-Rectangle
 */
class Rectangle extends Shape {
  constructor(w, h, x, y) {
    super();

    let size = random(1, 25);
    if(!w) {
      w = size;
    }
    if(!h) {
      h = size;
    }
    if(!x) {
      x = random(0, windowWidth);
    }
    if(!y) {
      y = random(0, windowHeight);
    }

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.size = w; // eigentlich (w+h)/2
  }

  draw(color, offsetX, offsetY) {
    if (color) {
      fill(color);
    }

    if (!offsetX) {
      offsetX = 0;
    }
    if (!offsetX) {
      offsetY = 0;
    }

    rect(
        this.x + offsetX,
        this.y + offsetY,
        this.w,
        this.h
    );
  }
}

/**
 * class to represent a 2D-Triangle
 */
class Triangle extends Shape {
  /**
   *
   * @param triangleMode Type of the Triangle -> "equilateral", "equilateral-upsidedown" or "random"
   * @param maxSidesLength
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @param x3
   * @param y3
   */
  constructor(triangleMode, maxSidesLength, x1, y1, x2, y2, x3, y3) {
    super();

    let firstX = random(0, windowWidth);
    let firstY = random(0, windowHeight);

    if(!maxSidesLength) {
      maxSidesLength = random(2, 33);
    }

    const heightConstant = 0.8660254037844386 * maxSidesLength;

    if(!triangleMode) {
      triangleMode = "equilateral";
    }

    if(!x1) {
      x1 = firstX;
    }
    if(!y1) {
      y1 = firstY;
    }

    if(triangleMode === "random") {
      if(!x2) {
        x2 = random(firstX - maxSidesLength, firstX + maxSidesLength);
      }
      if(!y2) {
        y2 = random(firstY - maxSidesLength, firstY + maxSidesLength);
      }
      if(!x3) {
        x3 = random(firstX - maxSidesLength, firstX + maxSidesLength);
      }
      if(!y3) {
        y3 = random(firstY - maxSidesLength, firstY + maxSidesLength);
      }
    }

    if(triangleMode === "equilateral-upsidedown") {
      if(!y1) {
        y1 += heightConstant + 7;
      }
      if(!x2) {
        x2 = firstX + maxSidesLength/2;
      }
      if(!y2) {
        y2 = firstY - heightConstant;
      }
      if(!x3) {
        x3 = firstX - maxSidesLength/2;
      }
      if(!y3) {
        y3 = firstY - heightConstant;
      }
    }

    else{ // -> triangleMode === "equilateral"
      if(!x2) {
        x2 = firstX + maxSidesLength/2;
      }
      if(!y2) {
        y2 = firstY + heightConstant;
      }
      if(!x3) {
        x3 = firstX - maxSidesLength/2;
      }
      if(!y3) {
        y3 = firstY + heightConstant;
      }
    }

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
    this.size = maxSidesLength;
  }

  draw(color, offsetX, offsetY) {
    if (color) {
      fill(color);
    }

    if (!offsetX) {
      offsetX = 0;
    }
    if (!offsetX) {
      offsetY = 0;
    }

    triangle(
        this.x1 + offsetX,
        this.y1 + offsetY,
        this.x2 + offsetX,
        this.y2 + offsetY,
        this.x3 + offsetX,
        this.y3 + offsetY
    );
  }
}
