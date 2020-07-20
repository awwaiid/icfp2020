import * as RefEngine from "./ref_engine.mjs";

function resultData(result) {

    console.dir(result, {depth: 1000})
    
    let gameStage = result[1]; 
    
    let gameInfo = result[2];
    let role = gameInfo[1]; // 0 = attack, 1 = defend

    let gameState = result[3];

    let gameTick = gameState != 'nil' && gameState[0];
    let gameX0 = gameState != 'nil' && gameState[1];

    let shipsAndCommands = gameState[2];
    let ships = {}; // mine, enemy
    // console.dir(shipsAndCommands);
    if(gameState != 'nil' && shipsAndCommands != 'nil') {
        shipsAndCommands.forEach(entry => {
            let ship = entry[0];
            let commands = entry[1];
            let shipInfo = {
                role: ship[0],
                shipId: ship[1],
                position: ship[2],
                velocity: ship[3],
                commands: commands
            };
            if (shipInfo.role == role) {
                ships.mine = shipInfo;
            } else {
                ships.enemy = shipInfo;
            }
        })
    }

    return {
        stage: gameStage, // 0 = pre, 1 = running, 2 = over
        role: role, // 0 = attack, 1 = defend
        tick: gameTick,
        x0: gameX0,
        ship: ships
    }
}

let playerKey;

async function run(doSetup = true) {

    let result;

    if (doSetup) {
        // create
        // [ '1', 2n ]
        result = await RefEngine.sendJs(['1', 2n]);
        console.dir(result, {depth: 1000});
    
        playerKey = result[1][0][1];
        console.log({playerKey});

    }
    
    // Join
    //  [ '2', 6051288275017681946n, 'nil' ]
    result = await RefEngine.sendJs(['2', playerKey, 'nil']);
    console.dir(resultData(result));

    // start
    // [ '3', 6051288275017681946n, 'nil' ]
    result = await RefEngine.sendJs(['3', playerKey, 'nil']);
    console.dir(resultData(result), { depth:1000});

    // commands
    // (4, playerKey, commands)

    let parsedResult = resultData(result);

    while(parsedResult.stage == 1n) {
        // Do nothing
        result = await RefEngine.sendJs(['4', playerKey, 'nil']);
        parsedResult = resultData(result);
        console.dir(parsedResult, { depth:1000});
    }

    // Self Destruct
    // result = await RefEngine.sendJs(['4', playerKey, [['1', resultData(result).ship.mine.shipId]]]);
    // console.dir(resultData(result), { depth:1000});

}



const serverUrl = process.argv[2];
playerKey = process.argv[3];

if(serverUrl) {
    RefEngine.setServerUrl(serverUrl);
}

if(playerKey) {
    run(false);
} else {
    run(true);
}


// Accelerate command
// (0, shipId, vector)

// Accelerates ship identified by shipId to the direction opposite to vector.

// Detonate command

// (1, shipId)

// Detonates ship identified by shipId.


// Shoot command

// (2, shipId, target, x3)


