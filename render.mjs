
const draw = require('imagejs');

//drawPictureFile([ [0,0], [10,10], [15,7], [9,9] ], "output.png");

/// draw
// ap draw ( )   =   |picture1|
// ap draw ( ap ap vec 1 1 )   =   |picture2|
// ap draw ( ap ap vec 1 2 )   =   |picture3|
// ap draw ( ap ap vec 2 5 )   =   |picture4|
// ap draw ( ap ap vec 1 2 , ap ap vec 3 1 )   =   |picture5|
// ap draw ( ap ap vec 5 3 , ap ap vec 6 3 , ap ap vec 4 4 , ap ap vec 6 4 , ap ap vec 4 5 )   =   |picture6|

// function draw(list) {
//     // extarct coords from list
//     drawPictureFile(coords, asdf)
// }

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
