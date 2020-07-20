import * as RefEngine from "./ref_engine.mjs";
import readlineSync from 'readline-sync';
import { renderAll } from './render.mjs';
import fs from 'fs';



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
    RefEngine.setFunctions( RefEngine.loadGalaxy() );

    let state = RefEngine.nil;
    let vector = { x: 0, y: 0 };

    // Just before the entry screen
    // [ '1', [ 11 ], '0', 'nil' ]
    // click 1 4
    let preScreen = RefEngine.parse([
        "ap", "ap", "cons", 1,
        "ap", "ap", "cons",
            "ap", "ap", "cons", "11",
            "nil",
        "ap", "ap", "cons", "0",
        "ap", "ap", "cons", "nil",
        "nil"
    ]);
    let preScreenClick = { x: 1, y: 4 };

    // Load up the state of the screen just BEFORE the big galaxy
    // and say thta we are clicking at 1, 4
    state = preScreen;
    vector = preScreenClick;

    // Galaxy start screen
    // [ '2', [ '1', -1 ], '0', 'nil' ]

    let entryScreen = RefEngine.parse([
        "ap", "ap", "cons", 2,
        "ap", "ap", "cons",
            "ap", "ap", "cons", "1",
            "ap", "ap", "cons", "-1",
            "nil", // list or vector?
        "ap", "ap", "cons", "0",
        "ap", "ap", "cons", "nil",
        "nil"
    ]);

    // state = entryScreen;

    while(true) {
        console.log("main")
        // TODO get the x,y from the user or the bot
        let click = RefEngine.parse(["ap", "ap", "cons", vector.x, vector.y]);
        // let click = new RefEngine.Ap(new RefEngine.Ap(cons, new RefEngine.Atom(vector.x)), new RefEngine.Atom(vector.y));
        let [newState, images] = await RefEngine.interact(state, click);

        //PRINT_IMAGES(images)
        // console.log("images");
        // console.dir(images, {depth: 200})
        let imagesData = RefEngine.consToJs(images);
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
