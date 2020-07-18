
// look for a library from npm which lets us generate a bitmap (png) by drawing pixels and outputing a file
// canvas = draw.newCanvas
// canvas.setPixel(23, 48) // coordinates
// canvas.writeToFile("out.png")

const draw = require('imagejs');

drawPictureFile([ [0,0], [10,10], [15,7], [9,9] ], "output.png");

function drawPictureFile(coordinates, fileName) {

    let xValues = [];
    for (i = 0; i < coordinates.length; i++) {
        xValues.push(coordinates[i][0]);
    }
    let width = Math.max(...xValues) + 1;

    let yValues = [];
    for (i = 0; i < coordinates.length; i++) {
        yValues.push(coordinates[i][1]);
    }
    let height = Math.max(...yValues) + 1;
    console.log({width, height});
    console.log({xValues,yValues});

    let bitmap = new draw.Bitmap({width, height, color: {r: 255, g: 255, b:255, a:255}});
    //let canvas = draw.newCanvas;
    //let ctx = canvas.getContext('2d');
    coordinates.forEach((point) => {
        let x = point[0];
        let y = point[1];
        //ctx.putImageData()
        bitmap.setPixel(x, y, 0, 0, 0);
    });
    
    return bitmap.writeFile(fileName)
    .then(function() {
        // bitmap has been saved
    });
}
