// MARIO INSERT ANSWER HERE

// (1) read file, probably one line at a time
// (2) for each line, split it into the left (memory address) of the = and the right (program)
// (3) for the stuff on the right turn it into an array
// (4) we'll then use the interpreter that we didn't write yet to interpret each line and store the result in an array based on the "memory address"
// (5) ...
// (6) profit?
// (7) glory!

// https://attacomsian.com/blog/reading-a-file-line-by-line-in-nodejs



// other stuff
const fs = require('fs');

//import fs from "fs";


try {
    
    const data = fs.readFileSync('galaxy.txt', 'UTF-8');

    const lines = data.split(/\r?\n/);

    let program = [];

    lines.forEach((Line) => {
        //console.log(Line);

        let programLine = Line.split(" ");

        let memoryValue = programLine[0];

        programLine.splice(0,2);

        let dividedLine = [memoryValue, programLine];

        program.push(dividedLine);

    });

    console.log(program);
    // [
    //     [ ":1149", ["ap", "ap", "c", "i", "ap"]],
    //     [ ":1150", ["ap", "ap", "c", "i", "ap"]],

    // ]

} catch (err) {

    console.error(err);
    
}



