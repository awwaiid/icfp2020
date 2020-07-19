
import draw from "imagejs";

export function render(coordinates, fileName) {

    console.log(coordinates);

    let xValues = [];
    for (let i = 0; i < coordinates.length; i++) {
        xValues.push(coordinates[i][0]);
    }
    let width = Math.max(...xValues) +1;

    let yValues = [];
    for (let i = 0; i < coordinates.length; i++) {
        yValues.push(coordinates[i][1]);
    }
    let height = Math.max(...yValues) +1;
    if (height > width) width = height;
    else height = width;


    let bitmap = new draw.Bitmap({width, height, color: {r: 255, g: 255, b:255, a:255}});
    
    var black = {r:0, g:0, b:0};

    for (let i = 0; i < coordinates.length; i++) {
        let point = coordinates[i]
        let x = parseInt(point[0]);
        let y = parseInt(point[1]);
        bitmap.setPixel(x, y, black);    
    }
    
    return writeToFile(bitmap, fileName)
    .then(function() {
        // bitmap has been saved
    });
}

function writeToFile(Bitmap, filename) {
    return Bitmap.writeFile(filename);
}
