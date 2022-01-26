/**
 * Text displayed via a polygonal P5-Shape
 * @author Marius Lenzing
 */
class TextPloygon {

    constructor(word, x, y, fontSize, letterSpacing) {
        this.word = word;
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;

        if(!letterSpacing) {
            letterSpacing = 17;
        }
        this.letterSpacing = letterSpacing;

        this.points = font.textToPoints(
            this.word,
            this.x,
            this.y,
            this.fontSize,
            {sampleFactor: 5}
        );

        this.letters = word.split("");
        this.pointsForEachLetter = [];
        let offsetX = 0;

        for(let i = 0; i < this.letters.length; i++) {
            let thisLetter = this.letters[i];

            let thisPoints = font.textToPoints(
                thisLetter,
                this.x + offsetX,
                this.y,
                this.fontSize,
                {sampleFactor: 5}
            );

            this.pointsForEachLetter[i] = {
                points: thisPoints,
                offsetX: offsetX
            };

            let thisBoundingBox = font.textBounds(thisLetter, 0, 0, this.fontSize);
            offsetX = offsetX + thisBoundingBox.w + letterSpacing;
        }

        this.collisionVectorsForEachLetter = [];

        for (let i = 0; i < this.pointsForEachLetter.length; i++) {
            let thisPoints = this.pointsForEachLetter[i].points;

            let thisLetterCollisionVectors = [];

            for (let j = 0; j < thisPoints.length; j++) {
                let point = thisPoints[j];

                let vector = createVector(
                    point.x,
                    point.y
                );
                thisLetterCollisionVectors.push(vector);
            }

            this.collisionVectorsForEachLetter.push(thisLetterCollisionVectors);
        }

        this.boundaryCircles = [];

        for (let i = 0; i < this.pointsForEachLetter.length; i++) {
            let thisLetter = this.pointsForEachLetter[i];
            let thisPoints = thisLetter.points;

            for (let i = 0; i < thisPoints.length; i++) {

                if (i%15 === 0) {
                    this.boundaryCircles.push(
                        new Circle(2.5, thisPoints[i].x, thisPoints[i].y)
                    );
                }
            }
        }
    }

    /**
     * draws the text via the text method of P5.
     * @param color
     */
    drawText(color) {
        if (color) {
            fill(color);
        }

        textSize(this.fontSize);

        for (let i = 0; i < this.pointsForEachLetter.length; i++) {
            let thisLetter = this.pointsForEachLetter[i];

            text(
                this.letters[i],
                this.x + thisLetter.offsetX,
                this.y
            );
        }
    }

    /**
     * draws the text via the beginShape method of P5. Buggy in some Situations...
     * especially with B, 8, and all other characters that have two holes.
     * @param color
     */
    drawShape(color) {
        if (color) {
            fill(color);
        }

        for (let i = 0; i < this.pointsForEachLetter.length; i++) {
            let thisLetter = this.pointsForEachLetter[i];
            let thisPoints = thisLetter.points;

            beginShape();
            for (let i = 0; i < thisPoints.length; i++) {
                vertex(
                    thisPoints[i].x,
                    thisPoints[i].y
                );
            }
            endShape(CLOSE);
        }
    }

    /**
     * draws a circle on every 15th point of the boundary points of each character.
     * @param color
     */
    drawCirclesOnBoundary(color) {
        if (color) {
            fill(color);
        }

        for (let i = 0; i < this.boundaryCircles.length; i++) {
            let thisCircle = this.boundaryCircles[i];

            thisCircle.draw();
        }
    }

    /**
     * Tells if the shape of this TextPolygon collides with a object of type Shape.
     * Buggy in some Situations... especially with B, 8, and all other characters that have two holes.
     * @param shape Shape
     * @return boolean
     */
    collidesWithShape(shape) {
        let shapeType = shape.getClassName();

        for (let i = 0; i < this.collisionVectorsForEachLetter.length; i++) {

            let collisionVectors = this.collisionVectorsForEachLetter[i];

            switch (shapeType) {
                case "Circle":
                    if (
                        collideCirclePoly(
                            shape.x, shape.y, shape.diameter,
                            collisionVectors,
                            true
                    )) {
                        return true;
                    }
                    break;

                case "Rectangle":
                    if (
                        collideRectPoly(
                            shape.x, shape.y, shape.w, shape.h,
                            collisionVectors,
                            true
                        )
                    ) {
                        return true;
                    }
                    break;

                case "Triangle":
                    let triangleVectors = [
                        createVector(shape.x1, shape.y1),
                        createVector(shape.x2, shape.y2),
                        createVector(shape.x3, shape.y3)
                    ];

                    if (
                        collidePolyPoly(
                            triangleVectors,
                            collisionVectors,
                            true
                        )
                    ) {
                        return true;
                    }
                    break;
            }
        }

        return false;
    }
}
