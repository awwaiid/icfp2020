
import draw from "imagejs";

export async function render(coordinates, fileName) {
    console.log("render", coordinates)

    let xValues = [];
    for (let i = 0; i < coordinates.length; i++) {
        xValues.push(parseInt(coordinates[i][0]));
    }

    let maxX = Math.max(...xValues);
    let minX = Math.min(...xValues);
    let width = maxX - minX + 1;
    let xOffset = 0 - minX;
    console.log({minX, maxX, width, xOffset});

    let yValues = [];
    for (let i = 0; i < coordinates.length; i++) {
        yValues.push(parseInt(coordinates[i][1]));
    }

    let maxY = Math.max(...yValues);
    let minY = Math.min(...yValues);
    let height = maxY - minY + 1;
    let yOffset = 0 - minY;
    console.log({minY, maxY, height, yOffset})

    // if (height > width) width = height;
    // else height = width;

    let bitmap = new draw.Bitmap({width, height, color: {r: 255, g: 255, b:255, a:255}});
    
    var black = {r:0, g:0, b:0};

    for (let i = 0; i < coordinates.length; i++) {
        let point = coordinates[i]
        let x = parseInt(point[0]) + xOffset;
        let y = parseInt(point[1]) + yOffset;
        bitmap.setPixel(x, y, black);    
    }
    
    console.log("writing to file...")
    await bitmap.writeFile(fileName)
    console.log("file saved")

}

