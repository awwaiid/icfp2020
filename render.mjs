
import draw from "imagejs";

export function render(coordinates, fileName) {

    console.log(coordinates);

    let xValues = [];
    for (let i = 0; i < coordinates.length; i++) {
        xValues.push(coordinates[i][0]);
    }
    let width = Math.max(...xValues);

    let yValues = [];
    for (let i = 0; i < coordinates.length; i++) {
        yValues.push(coordinates[i][1]);
    }
    let height = Math.max(...yValues);


    width = 32;
    height = 32;

    console.log({width, height});
    console.log({xValues,yValues});

    let bitmap = new draw.Bitmap({width, height, color: {r: 255, g: 255, b:255, a:255}});
    
    var black = {r:1, g:0, b:0};
    bitmap.setPixel(1,1, black);
    bitmap.setPixel(2,2, black);
    bitmap.setPixel(3,3, black);
    bitmap.setPixel(4,4, black);
    bitmap.setPixel(5,10, black);
    bitmap.setPixel(5,11, black);

    for (let i = 0; i < coordinates.length; i++) {
        let point = coordinates[i]
        console.log(point);
        let x = point[0];
        let y = point[1];
        console.log(x);
        console.log(y);
        bitmap.setPixel(x, y, black);    
    }


    
    //let canvas = draw.newCanvas;
    //let ctx = canvas.getContext('2d');
    // console.log(coordinates);
    // coordinates.forEach((point) => {
    //     console.log(point);
    //     let x = point[0];
    //     let y = point[1];

    //     console.log(x, y);

    //     var black = {r:1, g:0, b:0}; // alpha defaults to 255
    //     bitmap.setPixel(x, y, black);
        
    //     console.log(bitmap.getPixel(x,y));
    // });
    
    return writeToFile(bitmap, fileName)
    .then(function() {
        // bitmap has been saved
    });
}

function writeToFile(Bitmap, filename) {
    // Bitmap.resize(
    //     {
    //         width: 300, height: 300,
    //         algorithm: "bicubicInterpolation",
    //         fit: "pad",
    //         padColor: {r:255, g:255, b:255, a:255}
    //     }
    // );
    return Bitmap.writeFile(filename);
}
