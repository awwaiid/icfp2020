import * as RefEngine from "./ref_engine.mjs";
import readlineSync from 'readline-sync';
import { renderAll } from './render.mjs';
import fs from 'fs';

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
            functions[memoryValue] = RefEngine.parse(programLine);
        });

        console.log("Galaxy loaded!");

        return functions;
    } catch (err) {
        console.error(err);
    }
}

import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin , output: process.stdout });

const getLine = (function () {
    const getLineGen = (async function* () {
        for await (const line of rl) {
            yield line;
        }
    })();
    return async () => ((await getLineGen.next()).value);
})();


async function main() {
    // Load up all of the galaxy functions
    RefEngine.setFunctions( loadGalaxy() );

    let state = RefEngine.nil;
    let vector = { x: 0, y: 0 };

    while(true) {
        console.log("main")
        // TODO get the x,y from the user or the bot
        let click = RefEngine.parse(["ap", "ap", "cons", vector.x, vector.y]);
        // let click = new RefEngine.Ap(new RefEngine.Ap(cons, new RefEngine.Atom(vector.x)), new RefEngine.Atom(vector.y));
        console.log("click:", click)
        let [newState, images] = RefEngine.interact(state, click)

        //PRINT_IMAGES(images)
        // console.log("images");
        // console.dir(images, {depth: 200})
        let imagesData = RefEngine.listToList(images);
        // console.log(imagesData);
        await renderAll(imagesData, 'output.png')
        // if(imagesData[0] && imagesData[0] != "nil") {
        //     await render(imagesData[0], 'output.png');
        // }
        // if(imagesData[1] && imagesData[1] != "nil") {

        //     await render(imagesData[1], 'output2.png')
        // }

        // let input = readlineSync.question("> ");
        console.log("Enter coords: ");
        let input = await getLine();
        let [x, y] = input.split(' ');
        vector.x = x;
        vector.y = y;
        state = newState;
    }
}

main().then(() => {
    console.log("main is done?")
});
