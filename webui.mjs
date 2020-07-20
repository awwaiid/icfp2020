import * as RefEngine from "./ref_engine.mjs";
import { renderAll } from './render.mjs';

let state = RefEngine.nil;
let vector = { x: 0, y: 0 };

async function setup() {
    // Load up all of the galaxy functions
    RefEngine.setFunctions( RefEngine.loadGalaxy() );

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

    // Send initial click
    await sendClick(vector, state);
}

    // state = entryScreen;

//     while(true) {

//         // sendClick(vector, state)

//         console.log("Enter coords: ");
//         let input = await getLine();
//         let [x, y] = input.split(' ');

//         vector.x = x;
//         vector.y = y;
//         state = newState;
//     }
// }

async function sendClick() {
    let click = RefEngine.parse(["ap", "ap", "cons", vector.x, vector.y]);
    let [newState, images] = await RefEngine.interact(state, click);
    let imagesData = RefEngine.consToJs(images);
    await renderAll(imagesData, 'public/output.png')

    state = newState;
}


import express from 'express';

let app = express();

app.use(express.static('public'));

function renderPage() {
    return `

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script>
$(document).ready(function() {
    $("#galaxy").on("click", function(event) {
        bounds=this.getBoundingClientRect();
        var left=bounds.left;
        var top=bounds.top;
        var x = event.pageX - left;
        var y = event.pageY - top;
        var cw=this.clientWidth
        var ch=this.clientHeight
        var iw=this.naturalWidth
        var ih=this.naturalHeight
        var px=x/cw*iw
        var py=y/ch*ih
        //alert("click on "+this.tagName+" at pixel ("+px+","+py+") mouse pos ("+x+"," + y+ ") relative to boundingClientRect at ("+left+","+top+") client image size: "+cw+" x "+ch+" natural image size: "+iw+" x "+ih );
        $('#x').val(parseInt(px - (iw / 2)));
        $('#y').val(parseInt(py - (ih / 2)));
        $('#theform').submit();
    });
});
</script>
     
   Hello world!

   <form id=theform action="/click" method="get">
   <input id=x type="text" name="x">
   <input id=y type="text" name="y">
   <input type=submit />
   </form>
   <img id="galaxy" src="/output.png">
    `;
}

app.get('/play', function(req, res){
   res.send(renderPage());
});

app.get('/click/', async (req, res) => {
    let x = req.query.x;
    let y = req.query.y;
    console.log("Click!", { x, y});
    vector.x = x;
    vector.y = y;
    await sendClick();
    res.send(renderPage());
});

app.get('/', async (req, res) => {
    await setup();
    res.redirect('/play')
});


app.listen(3001);

