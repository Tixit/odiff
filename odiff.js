"use strict";

/* Copyright (c) 2013 Billy Tetrud - Free to use for any purpose: MIT License*/
// gets the changes that need to happen to a to change it into b
// returns an object with the members
    // type
    // property
    // value
    // values
    // count
module.exports = function(a,b) {
    var results = []
    diffInternal(a,b,results,[])
    return results
}

var diffInternal = function(a,b,acc,base) {
    if(a === b || Number.isNaN(a)&&Number.isNaN(b)) {
        return;
    } else if(a instanceof Array && b instanceof Array) {
        var an=a.length-1,bn=b.length-1
        while(an >= 0 && bn >= 0) {     // loop backwards (so that making changes in order will work correctly)
            if(!equal(a[an], b[bn])) {
                var indexes = findMatchIndexes(equal, a,b, an,bn, 0, 0)

                var anInner=an,bnInner=bn
                while(anInner > indexes.a && bnInner > indexes.b) {
                    if(similar(a[anInner], b[bnInner])) {
                        // get change for that element
                        diffInternal(a[anInner],b[bnInner],acc, base.concat([anInner]))
                        anInner--; bnInner--;
                    } else {
                        var indexesInner = findMatchIndexes(similar, a,b, anInner,bnInner, indexes.a+1, indexes.b+1)

                        var numberPulled = anInner-indexesInner.a
                        var numberPushed = bnInner-indexesInner.b

                        if(numberPulled === 1 && numberPushed === 1) {
                            set(acc, base.concat(indexesInner.a+1), b[indexesInner.b+1]) // set the one
                        } else if(numberPulled === 1 && numberPushed === 2) {
                            // set one, push the other
                            add(acc, base,indexesInner.a+2, b.slice(indexesInner.b+2, bnInner+1))
                            set(acc, base.concat(indexesInner.a+1), b[indexesInner.b+1])
                        } else if(numberPulled === 2 && numberPushed === 1) {
                            // set one, pull the other
                            rm(acc, base, indexesInner.a+2, 1, a)
                            set(acc, base.concat(indexesInner.a+1), b[indexesInner.b+1])
                        } else if(numberPulled === 2 && numberPushed === 2) {
                            set(acc, base.concat(indexesInner.a+2), b[indexesInner.b+2])
                            set(acc, base.concat(indexesInner.a+1), b[indexesInner.b+1])
                        } else {
                            if(numberPulled > 0) { // if there were some elements pulled
                                rm(acc, base, indexesInner.a+1, numberPulled, a)
                            }
                            if(numberPushed > 0) { // if there were some elements pushed
                                add(acc, base,indexesInner.a+1, b.slice(indexesInner.b+1, bnInner+1))
                            }
                        }

                        anInner = indexesInner.a
                        bnInner = indexesInner.b
                    }
                }

                if(anInner > indexes.a) {        // more to pull
                    rm(acc, base, anInner, anInner-indexes.a, a)
                } else if(bnInner > indexes.b) { // more to push
                    add(acc, base, anInner+1, b.slice(indexes.b+1, bnInner+1))
                }

                an = indexes.a
                bn = indexes.b
            } else {
                an--; bn--;
            }
        }

        if(an >= 0) {        // more to pull
            rm(acc, base, 0, an+1, a)
        } else if(bn >= 0) { // more to push
            add(acc, base,0, b.slice(0, bn+1))
        }

    } else if(a instanceof Date && b instanceof Date) {
        if(a.getTime() !== b.getTime()) {
            set(acc, base, b)
        }
    } else if(a instanceof Object && b instanceof Object) {
        var keyMap = merge(arrayToMap(Object.keys(a)), arrayToMap(Object.keys(b)))
        for(var key in keyMap) {
            var path = base.concat([key])
            if(key in a && !(key in b)) {
                unset(acc, path)
            } else {
                diffInternal(a[key],b[key],acc, path)
            }
        }
    } else {
        set(acc, base, b)
    }

    // adds a 'set' type to the changeList
    function set(changeList, property, value) {
        changeList.push({
            type:'set',
            path: property,
            val: value
        })
    }

    // adds an 'unset' type to the changeList
    function unset(changeList, property) {
        changeList.push({
            type:'unset',
            path: property
        })
    }

    // adds an 'rm' type to the changeList
    function rm(changeList, property, index, count, a) {
        var finalIndex = index ? index - count + 1 : 0
        changeList.push({
            type:'rm',
            path: property,
            index: finalIndex,
            num: count,
            vals: a.slice(finalIndex, finalIndex+count)
        })
    }

    // adds an 'add' type to the changeList
    function add(changeList, property, index, values) {
        changeList.push({
            type:'add',
            path: property,
            index: index,
            vals: values
        })
    }
}

module.exports.similar = similar
module.exports.equal = equal
module.exports.applySingle = applySingle
module.exports.applyAll = applyAll


// finds and returns the closest indexes in a and b that match starting with divergenceIndex
// note: loops backwards like the rest of this stuff
// returns the index beyond the first element (aSubMin-1 or bSubMin-1) for each if there is no match
// parameters:
    // compareFn - determines what matches (returns true if the arguments match)
    // a,b - two arrays to compare
    // divergenceIndexA,divergenceIndexB - the two positions of a and b to start comparing from
    // aSubMin,bSubMin - the two positions to compare until
function findMatchIndexes(compareFn, a,b, divergenceIndexA,divergenceIndexB, aSubMin, bSubMin) {
    var maxNForA = divergenceIndexA-aSubMin
    var maxNForB = divergenceIndexB-bSubMin
    var maxN = Math.max(maxNForA, maxNForB)
    for(var n=1; n<=maxN; n++) {
        var newestA = a[divergenceIndexA-n] // the current item farthest from the divergence index being compared
        var newestB = b[divergenceIndexB-n]

        if(n<=maxNForB && n<=maxNForA && compareFn(newestA, newestB)) {
            return {a:divergenceIndexA-n, b:divergenceIndexB-n}
        }

        for(var j=0; j<n; j++) {
            var elemA = a[divergenceIndexA-j] // an element between the divergence index and the newest items
            var elemB = b[divergenceIndexB-j]

            if(n<=maxNForB && compareFn(elemA, newestB)) {
                return {a:divergenceIndexA-j, b:divergenceIndexB-n}
            } else if(n<=maxNForA && compareFn(newestA, elemB)) {
                return {a:divergenceIndexA-n, b:divergenceIndexB-j}
            }
        }
    }
    // else
    return {a: aSubMin-1, b: bSubMin-1}
}


// compares arrays and objects and returns true if they're similar meaning:
    // less than 2 changes, or
    // less than 10% different members
function similar(a,b) {
    if(a instanceof Array) {
        if(!(b instanceof Array))
            return false

        var tenPercent = a.length/10
        var notEqual = Math.abs(a.length-b.length) // initialize with the length difference
        for(var n=0; n<a.length; n++) {
            if(equal(a[n],b[n])) {
                if(notEqual >= 2 && notEqual > tenPercent || notEqual === a.length) {
                    return false
                }

                notEqual++
            }
        }
        // else
        return true

    } else if(a instanceof Object) {
        if(!(b instanceof Object))
            return false

        var keyMap = merge(arrayToMap(Object.keys(a)), arrayToMap(Object.keys(b)))
        var keyLength = Object.keys(keyMap).length
        var tenPercent = keyLength / 10
        var notEqual = 0
        for(var key in keyMap) {
            var aVal = a[key]
            var bVal = b[key]

            if(!equal(aVal,bVal)) {
                if(notEqual >= 2 && notEqual > tenPercent || notEqual+1 === keyLength) {
                    return false
                }

                notEqual++
            }
        }
        // else
        return true

    } else {
        return a===b || Number.isNaN(a) && Number.isNaN(b)
    }
}

// compares arrays and objects for value equality (all elements and members must match)
function equal(a,b) {
    if(a instanceof Array) {
        if(!(b instanceof Array))
            return false
        if(a.length !== b.length) {
            return false
        } else {
            for(var n=0; n<a.length; n++) {
                if(!equal(a[n],b[n])) {
                    return false
                }
            }
            // else
            return true
        }
    } else if(a instanceof Object) {
        if(!(b instanceof Object))
            return false

        var aKeys = Object.keys(a)
        var bKeys = Object.keys(b)

        if(aKeys.length !== bKeys.length) {
            return false
        } else {
            for(var n=0; n<aKeys.length; n++) {
                var key = aKeys[n]
                var aVal = a[key]
                var bVal = b[key]

                if(!equal(aVal,bVal)) {
                    return false
                }
            }
            // else
            return true
        }
    } else {
        return a===b || Number.isNaN(a) && Number.isNaN(b)
    }
}


function applySingle(diff,data) {
    if (!diff || diff.path.length === 0) {
        return data;
    }
    const result = data || (typeof diff.path[0] === 'number' ? [] : {});
    var cursor = result;
    // Prepare the cursor
    var index;
    var pathLen = diff.path.length;
    for (index = 0; index < pathLen - 1; index++) {
        var path = diff.path[index];
        if (typeof cursor[path] === 'undefined') {
            cursor[path] = typeof path === 'number' ? [] : {};
        }
            cursor = cursor[path];
    }
    var lastPath = diff.path[index];
    // Perform the diff operation
    switch (diff.type) {
    case 'set':
        cursor[lastPath] = diff.val;
        break;
    case 'unset':
        delete cursor[lastPath];
        break;
    case 'add': {
        if (typeof cursor[lastPath] === 'undefined') {
            cursor[lastPath] = [];
        }
        const cursorAsArray = cursor[lastPath];
        cursor[lastPath] = cursorAsArray
            .slice(0, diff.index)
            .concat(diff.vals)
            .concat(cursorAsArray.slice(diff.index));
        break;
    }
    case 'rm':
        if (typeof cursor[lastPath] === 'undefined') {
            cursor[lastPath] = [];
        } else {
            cursor[lastPath].splice(
                diff.index,
                diff.rm.length,
            );
        }
        break;
    default:
        throw new Error(`Unsupported diff operation: ${diff.type}`);
    }
    return result;
}


function applyAll(diffs,data) {
    var result;
    for (let index = 0; index < diffs.length; index++) {
        result = applySingle(diffs[index], data);
    }
    return result;
}


// turns an array of values into a an object where those values are all keys that point to 'true'
function arrayToMap(array) {
    var result = {}
    array.forEach(function(v) {
        result[v] = true
    })
    return result
}

// Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
// returns obj1 (now mutated)
function merge(obj1, obj2){
    for(var key in obj2){
        obj1[key] = obj2[key]
    }

    return obj1
}

