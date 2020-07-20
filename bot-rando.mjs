import * as RefEngine from "./ref_engine.mjs";

function resultData(result) {

    console.dir(result, {depth: 1000})
    
    let gameStage = result[1]; 
    
    let gameInfo = result[2]; // assume nil

    let role = gameInfo && (gameInfo != 'nil') && gameInfo[1]; // 0 = attack, 1 = defend
    
    let gameState = result[3]; // assume nil
    
    let gameTick = gameState && (gameState != 'nil') && gameState[0];
    let gameX0 = gameState && (gameState != 'nil') && gameState[1];

    let shipsAndCommands = gameState && (gameState != 'nil') && gameState[2];
    let ships = {}; // mine, enemy
    // console.dir(shipsAndCommands);
    if(gameState && gameState != 'nil' && shipsAndCommands != 'nil') {
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

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
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
    
    await sleep(100);

    // Join
    //  [ '2', 6051288275017681946n, 'nil' ]
    result = await RefEngine.sendJs(['2', playerKey, 'nil']);
    console.dir(resultData(result));

    await sleep(100);

    // start
    // [ '3', 6051288275017681946n, 'nil' ]
    result = await RefEngine.sendJs(['3', playerKey, 'nil']);
    console.dir(resultData(result), { depth:1000});

    await sleep(100);

    // commands
    // (4, playerKey, commands)

    let parsedResult = resultData(result);

    while(parsedResult.stage == 1n) {

        let action = 'nothing';

        // Do nothing
        if(action == 'nothing') {
            result = await RefEngine.sendJs(['4', playerKey, 'nil']);
            parsedResult = resultData(result);
            console.dir(parsedResult, { depth:1000});
        }

        // Shoot laser at the other player
        // (2, shipId, target, x3) where target is a position vector 
        if(action == 'laser') {
            result = await RefEngine.sendJs(['4', playerKey, [['2', parsedResult.ship.mine.shipId, [0n, 0n] ]]]);
            parsedResult = resultData(result);
            console.dir(parsedResult, { depth:1000});
        }

        // Self Destruct
        if(action == 'self-destruct') {
            result = await RefEngine.sendJs(['4', playerKey, [['1', resultData(result).ship.mine.shipId]]]);
            console.dir(resultData(result), { depth:1000});
        }

        // Wait a bit before the next end I guess
        await sleep(100);
    }


}


const serverUrl = process.argv[2];
playerKey = process.argv[3];

console.log({ serverUrl, playerKey });

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


