
import draw from "imagejs";

export async function renderAll(images, fileName) {

    let xValues = [];
    let yValues = [];

    images.forEach((image, index) => {
        if(Array.isArray(image)) {
            for (let i = 0; i < image.length; i++) {
                xValues.push(parseInt(image[i][0]));
            }
            for (let i = 0; i < image.length; i++) {
                yValues.push(parseInt(image[i][1]));
            }
        }
    });

    let maxX = Math.max(...xValues);
    let minX = Math.min(...xValues);
    if(Math.abs(maxX) > Math.abs(minX)) {
        maxX = Math.abs(maxX);
        minX = -1 * Math.abs(maxX);
    } else {
        maxX = Math.abs(minX);
        minX = -1 * Math.abs(minX);
    }
    let width = maxX - minX + 1;
    
    let maxY = Math.max(...yValues);
    let minY = Math.min(...yValues);
    if(Math.abs(maxY) > Math.abs(minY)) {
        maxY = Math.abs(maxY);
        minY = -1 * Math.abs(maxY);
    } else {
        maxY = Math.abs(minY);
        minY = -1 * Math.abs(minY);
    }
    let height = maxY - minY + 1;

    let xOffset = 0 - minX;
    console.log({minX, maxX, width, xOffset})
    let yOffset = 0 - minY;
    console.log({minY, maxY, height, yOffset});

    let bitmap = new draw.Bitmap({width, height, color: {r: 255, g: 255, b:255, a:255}});
    let colors = [
        {r:0, g:0, b:0}, // black
        {r:255, g:0, b:0}, // red
        {r:0, g:255, b:0}, // green
        {r:0, g:0, b:255}, //blue
        {r:255, g:128, b: 0},
        {r:128, g:255, b:0},
        {r:128, g:0, b:255},
        {r:0, g:128, b:255}
    ];

    images.forEach((image, index) => {
        if(Array.isArray(image)) {
            for (let i = 0; i < image.length; i++) {
                let point = image[i]
                let x = parseInt(point[0]) + xOffset;
                let y = parseInt(point[1]) + yOffset;
                let current = bitmap.getPixel(x, y);
                // console.log({current})
                let newColor = colors[index];
                current.r = (current.r + newColor.r) / 2;
                current.g = (current.g + newColor.g) / 2;
                current.b = (current.b + newColor.b) / 2;
                bitmap.setPixel(x, y, current);    
            }
        }
    });

    console.log("writing to file...");
    await bitmap.writeFile(fileName);
    console.log("file saved");

}

export async function render(coordinates, fileName) {
    // console.log("render", coordinates)

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

