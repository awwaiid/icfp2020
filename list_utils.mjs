

function listContentToString(list) {
    // console.log("printing list content", {list})
        if (primitives.isnil(list) == primitives.t) {
            return "";
        } else {
            let head = primitives.car(list);
            let tail = primitives.cdr(list);
            // console.log("printing content with", { head, tail })
            return listToString(head) + " " + listContentToString(tail);
        }
}

export function listToString(list) {
    // console.log("printing list", {list})
    if (list instanceof Function) {
        return "(" + listContentToString(list).trim() + ")";
    } else {
        return list;
    }
}

function listContentToList(list) {
    // console.log("printing list content", {list})
        if (primitives.isnil(list) == primitives.t) {
            return [];
        } else {
            let head = primitives.car(list);
            let tail = primitives.cdr(list);
            // console.log("printing content with", { head, tail })
            return [listToList(head), ...listContentToList(tail)];
        }
}

export function listToList(list) {
    // console.log("printing list", {list})
    if (list instanceof Function) {
        return [ ...listContentToList(list) ];
    } else {
        return list;
    }
}

// list = evil(["ap", "ap", "cons", "3", "nil"])
// console.log(list.toString())
// console.log(listToString(list));


// list = evil(["ap", "ap", "ap", "cons", "3", "2", "nil"]);
// console.log("ast of list", getNext(["ap", "ap", "cons", "2", "ap", "ap", "cons", "3", "nil"]))
// list = evil(["ap", "ap", "cons", "2", "ap", "ap", "cons", "3", "nil"]); // (2 . (3 . nil))

// console.log(list.toString())
// list_tail = primitives.cdr(list)
// console.log(list_tail);
// console.log(primitives.car(list_tail))
// list_tail_tail = primitives.cdr(list_tail);
// console.log(list_tail_tail);

// console.log(listToString(list))
// console.log(listToString(list))

// console.log(listToList(list))
// console.log(listToList(list))

// list2 = evil(["ap", "ap", "cons", "ap", "ap", "cons", "2", "nil", "ap", "ap", "cons", "5", "nil"])
// console.log(listToList(list2))

// // ap ap cons 2 ap ap cons 7 nil

// // 3 . (2 . nil)
// // ap ap cons 3 ap ap cons 463 nil => from galaxy.txt
// console.log("list", list);
// console.log("car", primitives.car(list))
// console.log("cdr", primitives.cdr(list))
// console.log("car cdr", primitives.car( primitives.cdr( list )))

// console.log(primitives.car(primitives.cdr(list)))
// console.log(listToString(list))

