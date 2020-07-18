import * as Engine from "./engine.mjs";

import fs from 'fs';
//const fs = require('fs');
//import { defaultMaxListeners } from 'stream';

function loadGalaxy() {
    let functions = {};

    try {

        const data = fs.readFileSync('galaxy.txt', 'UTF-8');

        const lines = data.split(/\r?\n/);

        let program = [];

        lines.forEach((Line) => {
            let programLine = Line.split(" ");
            let memoryValue = programLine[0];
            programLine.splice(0, 2);
            functions[memoryValue] = Engine.getNext(programLine);
        });

        // console.log(functions);
        console.log("Galaxy loaded!");
        return functions;

    } catch (err) {

        console.error(err);

    }

}


let galaxy = loadGalaxy();
Engine.setWorld(galaxy);
// debugger
// ap ap cons flag ap ap cons newState ap ap cons data nil
Engine.evil(["ap", "ap", "ap", "interact", "galaxy", "nil", "ap", "ap", "cons", "0", "ap", "ap", "cons", "0", "nil"])

// :1338 = ap ap c ap ap b c ap ap c ap ap b c :1342 :1328 :1336
           
// galxy = :1338

// debugger
// runTests();
