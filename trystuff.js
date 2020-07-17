

let primitives = {
    inc: (n) => parseInt(n) + 1,
    dec: (n) => parseInt(n) - 1,
    t: (x) => (y) => x,
    f: (x) => (y) => y,
    s: (x0) => (x1) => (x2) => x0(x2)( x1(x2) ),
    mul: (x) => (y) => parseInt(x) * parseInt(y),
    div: (x) => (y) => Math.floor(parseInt(x) / parseInt(y)),
    add: (x) => (y) => parseInt(x) + parseInt(y),
    neg: (x) => -1 * parseInt(x),
};

function is(desc, a, b) {
    if (a === b) {
        console.log("OK # ", desc)
    } else {
        console.log("FAIL # ", desc, " got ", a, " expected ", b)
    }
}

function interpret(proggie) {
    if(!Array.isArray(proggie)) {
        return [proggie];
    }
    let cmd = proggie[0];
    
    //console.log("interpret", {cmd});
    if(cmd === "ap") {
        let ap_params = proggie.slice(1);

        //console.log("In ap")
        let evaluated_partial_function = interpret(ap_params);

        //console.log({evaluated_partial_function});
        let f = evaluated_partial_function[0];

        let evaluated_params = interpret(evaluated_partial_function.slice(1));

        let param = evaluated_params[0];
        let remaining_data = evaluated_params.slice(1);
        
        //let otherstuff = goodstuff.slice(2);
        //console.log({f, param});
        let result = f(param);
        return interpret([result, ...remaining_data]);
    }
    if(primitives[cmd]) {
        return [primitives[cmd], ...proggie.slice(1)];
    }
    //console.log("Not ap ... just returning")
    return proggie;
}

function interp(p) {
    return interpret(p)[0];
}

function runTests() {

    is("multiplication", interpret(["ap","ap","mul","5","3"])[0], 15);
    is("triple inc", interpret(["ap", "inc", "ap", "inc", "ap", "inc", 0])[0], 3); // should be 3
    
    
    is( "#22 False example", interpret(["ap", "ap", "f", 1, 5])[0], 5);
    
    //"ap" "ap" t 1 5   =  1
    is( "#21 K combinator example", interpret(["ap","ap","t",1, 5])[0], 1);

    //"ap" "ap" t "ap" "inc" 5 t   =   6
    is( "#21 K combinator last example", interpret(["ap", "ap", "t", "ap", "inc", 5, "t"])[0], 6);


    // "ap" "inc" "ap" "inc" 0   =   2
    is( "#17 and #5 function application example 1", interpret(["ap", "inc","ap", "inc",0])[0], 2 );

    // "ap" "inc" "ap" "inc" "ap" "inc" 0   =   3

    is( "#17 and #5 ex 2",
        interpret(["ap","inc","ap","inc","ap","inc",0])[0],
        3);

    is("add 1, 2, 3 with curry", interpret(["ap","ap","add",1,"ap","ap","add",2,3])[0], 6);
}

runTests();

