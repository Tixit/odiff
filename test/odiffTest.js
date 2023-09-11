"use strict";

var Unit = require('deadunit')
var odiff = require('../odiff')

require("../build") // build every you test so you don't forget to update the bundle

Unit.test("Testing odiff", function() {

    

    //*

    this.test("simple value test", function() {
        var diffs = odiff(1,2)
        this.eq(diffs.length, 1)
        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, []), d.path, [])
        this.eq(d.val, 2)
    })
    this.test("simple value test - strong equality", function() {
        var diffs = odiff("",0)
        this.eq(diffs.length, 1)

        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, []), d.path, [])
        this.eq(d.val, 0)
    })
    this.test("NaN test", function() {
        var a = {x: NaN}
        var b = {x: NaN}

        var diffs = odiff(a,b)
        this.eq(diffs.length, 0)
    })
    this.test("Date test", function() {
        var diffs = odiff(new Date('2016-08-11'), new Date('2017-09-12'))
        this.eq(diffs.length, 1)

        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, []), d.path, [])
        this.eq(d.val.getTime(), new Date('2017-09-12').getTime())
    })

    this.test('simple object unset', function() {
        var diffs = odiff({x:1},{})

        this.eq(diffs.length, 1)
        var d = diffs[0]

        this.eq(d.type, 'unset')
        this.ok(odiff.equal(d.path, ['x']), d.path, ['x'])
    })

    this.test('simple object diff', function() {
        var a = {a: 1, b:2, c:3}
        var b = {a: 1, b:2, c:undefined, d:3}

        var diffs = odiff(a,b)

        this.eq(diffs.length, 2)

        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, ['c']), d.path, ['c'])
        this.eq(d.val, undefined)

        d = diffs[1]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, ['d']), d.path, ['d'])
        this.eq(d.val, 3)
    })
    this.test('simple array diff - rm', function() {
        var a = [1,2,3]
        var b = []

        var diffs = odiff(a,b)
        this.eq(diffs.length, 1)

        var d = diffs[0]
        this.eq(d.type, 'rm')
        this.eq(d.path.length, 0)
        this.eq(d.index, 0)
        this.eq(d.num, 3)
        this.ok(odiff.equal(d.vals, [1,2,3]))
    })
    this.test('simple array diff - rm multiple contiguous', function() {
        var a = [1,2,3]
        var b = [1]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 1)

        var d = diffs[0]
        this.eq(d.type, 'rm')
        this.eq(d.path.length, 0)
        this.eq(d.index, 1)
        this.eq(d.num, 2)
        this.ok(odiff.equal(d.vals, [2,3]), d.vals, [2,3])
    })

    this.test('simple array diff - add', function() {
        var a = []
        var b = [1,2,3]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 1)

        var d = diffs[0]
        this.eq(d.type, 'add')
        this.eq(d.path.length, 0)
        this.eq(d.index, 0)
        this.ok(odiff.equal(d.vals, [1,2,3]), d.vals, [1,2,3])
    })
    this.test('simple array diff - change', function() {
        var a = [1,2,3]
        var b = [1,2,4]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 1)

        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [2]), d.path, [2])
        this.eq(d.val, 4)
    })
    this.test('array diff - added one, then removed one', function() {
        var a = [1,    2,3,4,5]
        var b = [1,1.1,2,3,  5]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 2)

        //  note that these are in reverse array order on purpose - so that applying the differences in order yeilds the correct result

        var d = diffs[0]
        this.eq(d.type, 'rm')
        this.eq(d.path.length, 0)
        this.eq(d.index, 3)
        this.eq(d.num, 1)
        this.ok(odiff.equal(d.vals, [4]))

        d = diffs[1]
        this.eq(d.type, 'add')
        this.eq(d.path.length, 0)
        this.eq(d.index, 1)
        this.ok(odiff.equal(d.vals, [1.1]), d.vals, [1.1])
    })

    this.test('array diff - similar subitem', function() {
        var a = [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        ]
        var b = [
          [1, 2, 3, 4, 99, 6, 7, 8, 9, 10]
        ]
      
        var diffs = odiff(a,b)
      
        this.eq(diffs.length, 1)

        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [ 0, 4 ]), d.path, ['c'])
        this.eq(d.val, 99)
    })
  
    this.test('array diff - dissimilar', function() {
        var a = [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        ]
        var bsubitem = [10, 20, 30, 40, 5, 6, 70, 80, 90, 100]
        var b = [
          bsubitem
        ]
      
        var diffs = odiff(a,b)
      
        this.eq(diffs.length, 1)

        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [ 0 ]), d.path, ['c'])
        this.eq(d.val, bsubitem)
    })
  
    this.test('complex array diff', function() {
        var a = [{a:1,b:2,c:3},              {x:1,y: 2, z:3},              {w:9,q:8,r:7}]
        var b = [{a:1,b:2,c:3},{t:4,y:5,u:6},{x:1,y:'3',z:3},{t:9,y:9,u:9},{w:9,q:8,r:7}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 3)

        var d = diffs[0]
        this.eq(d.type, 'add')
        this.eq(d.path.length, 0)
        this.eq(d.index, 2)
        this.ok(odiff.equal(d.vals, [{t:9,y:9,u:9}]))

        d = diffs[1]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [1,'y']), d.path, [1,'y'])
        this.eq(d.val, '3')

        d = diffs[2]
        this.eq(d.type, 'add')
        this.eq(d.path.length, 0)
        this.eq(d.index, 1)
        this.ok(odiff.equal(d.vals, [{t:4,y:5,u:6}]), d.vals, [{t:4,y:5,u:6}])
    })
    this.test("complex array diff - distinguish set and add", function() {
        var a = [{a:1,b:2},            {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]
        var b = [{a:1,b:2}, {a:9,b:8}, {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 1)

        var d = diffs[0]
        this.eq(d.type, 'add')
        this.eq(d.path.length, 0)
        this.eq(d.index, 1)
        this.ok(odiff.equal(d.vals, [{a:9,b:8}]), d.vals, [{a:9,b:8}])
    })
    this.test("complex array diff - distinguish set and rm", function() {
        var a = [{a:1,b:2}, {a:9,b:8}, {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]
        var b = [{a:1,b:2},            {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 1)

        var d = diffs[0]
        this.eq(d.type, 'rm')
        this.eq(d.path.length, 0)
        this.eq(d.index, 1)
        this.eq(d.num,1)
        this.ok(odiff.equal(d.vals, [{a:9,b:8}]))
    })

    this.test("complex array diff - change then add", function() {
        var a = [{a:1,b:2}, {a:9,b: 8 },            {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]
        var b = [{a:1,b:2}, {a:9,b:'7'}, {a:8,b:1}, {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 2)

        var d = diffs[0]
        this.eq(d.type, 'add')
        this.eq(d.path.length, 0)
        this.eq(d.index, 2)
        this.ok(odiff.equal(d.vals, [{a:8,b:1}]))

        d = diffs[1]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [1,'b']), d.path, [1,'b'])
        this.eq(d.val, '7')
    })
    this.test("complex array diff - add then change", function() {
        var a = [{a:1,b:2},            {a:9,b: 8 }, {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]
        var b = [{a:1,b:2}, {a:8,b:1}, {a:9,b:'7'}, {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 2)

        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [1,'b']), d.path, [1,'b'])
        this.eq(d.val, '7')

        d = diffs[1]
        this.eq(d.type, 'add')
        this.eq(d.path.length, 0)
        this.eq(d.index, 1)
        this.ok(odiff.equal(d.vals, [{a:8,b:1}]))
    })

    this.test("complex array diff - change then remove", function() {
        var a = [{a:1,b:2}, {a:9,b: 8 }, {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]
        var b = [{a:1,b:2}, {a:9,b:'7'},            {a:5,b:6}, {a:7,b:8}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 2)

        var d = diffs[0]
        this.eq(d.type, 'rm')
        this.eq(d.path.length, 0)
        this.eq(d.index, 2)
        this.eq(d.num,1)

        d = diffs[1]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [1,'b']), d.path, [1,'b'])
        this.eq(d.val, '7')
    })
    this.test("complex array diff - remove then change", function() {
        var a = [{a:1,b:2}, {a:9,b: 8 }, {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]
        var b = [           {a:9,b:'7'}, {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 2)

        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [1,'b']), d.path, [1,'b'])
        this.eq(d.val, '7')

        d = diffs[1]
        this.eq(d.type, 'rm')
        this.eq(d.path.length, 0)
        this.eq(d.index, 0)
        this.eq(d.num,1)
    })

    this.test("complex array diff - move", function() {

        var a = [{a:1,b:2},{a:3,b:4}, {a:5,b:6}, {a:7,b:8},            {a:9,b:10}]
        var b = [{a:1,b:2},           {a:5,b:6}, {a:7,b:8}, {a:3,b:4}, {a:9,b:10}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 2)

        var d = diffs[0]
        this.eq(d.type, 'add')
        this.eq(d.path.length, 0)
        this.eq(d.index, 4)
        this.ok(odiff.equal(d.vals, [{a:3,b:4}]))

        d = diffs[1]
        this.eq(d.type, 'rm')
        this.eq(d.path.length, 0)
        this.eq(d.index, 1)
        this.eq(d.num, 1)
        this.ok(odiff.equal(d.vals, [{a:3,b:4}]))
    })

    this.test("complex array diff - add then change similar", function() {
        var a = [{a:1,b:2}, {a: 9,b: 8},            {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]
        var b = [{a:1,b:2}, {a:'8',b:8}, {a:7,b:2}, {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 2)

        var d = diffs[0]
        this.eq(d.type, 'add')
        this.eq(d.path.length, 0)
        this.eq(d.index, 2)
        this.ok(odiff.equal(d.vals, [{a:7,b:2}]))

        d = diffs[1]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [1,'a']), d.path, [1,'a'])
        this.eq(d.val, '8')
    })
    this.test("complex array diff - remove then change similar", function() {
        var a = [{a:9,b: 2 }, {a:7,b: 4}, {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]
        var b = [{a:9,b:'7'},             {a:3,b:4}, {a:5,b:6}, {a:7,b:8}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 2)

        var d = diffs[0]
        this.eq(d.type, 'rm')
        this.eq(d.path.length, 0)
        this.eq(d.index, 1)
        this.eq(d.num,1)
        this.ok(odiff.equal(d.vals, [{a:7,b: 4}]))

        d = diffs[1]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [0,'b']), d.path, [0,'b'])
        this.eq(d.val, '7')
    })
    this.test("complex array diff - set two in a row", function() {
        var a = [{a:9,b: 2 }, {a: 3 ,b:4}, {a:5,b:6}, {a:7,b:8}]
        var b = [{a:9,b:'7'}, {a:'4',b:4}, {a:5,b:6}, {a:7,b:8}]

        var diffs = odiff(a,b)
        this.eq(diffs.length, 2)

        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [1,'a']), d.path, [1,'a'])
        this.eq(d.val, '4')

        d = diffs[1]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, [0,'b']), d.path, [0,'b'])
        this.eq(d.val, '7')
    })

    this.test("deep diff test", function() {
        var a = {
            x: [1,2,3],
            y: {
                z: [
                    {a:1,b:2},
                    {c:3,d:4}
                ],
                aa: [
                    [1,2,3],
                    [5,6,7]
                ]
            }
        }
        var b = {
            x: [1,2,4],
            y: {
                z: [
                    {a:1,b:3},
                    {c:3,d:4}
                ],
                aa: [
                    [1,2,3],
                    [9,8],
                    [5,6.2,7]
                ]
            }
        }

        var diffs = odiff(a,b)
        this.eq(diffs.length, 4)

        var d = diffs[0]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, ['x',2]), d.path, ['x',2])
        this.eq(d.val, 4)

        d = diffs[1]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, ['y','z',0,'b']), d.path, ['y','z',0,'b'])
        this.eq(d.val, 3)

        d = diffs[2]
        this.eq(d.type, 'set')
        this.ok(odiff.equal(d.path, ['y','aa',1,1]), d.path, ['y','aa',1,1])
        this.eq(d.val, 6.2)

        d = diffs[3]
        this.eq(d.type, 'add')
        this.ok(odiff.equal(d.path, ['y','aa']), d.path, ['y','aa'])
        this.eq(d.index, 1)
        this.ok(odiff.equal(d.vals, [[9,8]]))
    })

    this.test("former bugs", function() {
        this.test('missing diff', function() {
            var a = {b:[1,{x:'y',e:1}   ]}
            var b = {b:[1,{x:'z',e:1}, 5]}

            var diffs = odiff(a,b)
            this.eq(diffs.length, 2)

            var d = diffs[0]
            this.eq(d.type, 'add')
            this.ok(odiff.equal(d.path, ['b']), d.path, ['b'])
            this.eq(d.index, 2)
            this.ok(odiff.equal(d.vals, [5]), d.vals, [5])

            d = diffs[1]
            this.eq(d.type, 'set')
            this.ok(odiff.equal(d.path, ['b',1,'x']), d.path, ['b',1,'x'])
            this.eq(d.val, 'z')
        })
        this.test('incorrect rm index', function() {
            const a = [
              {},
              {},
              {a:null},
              {b:null},
              {c:null},
              {}
            ]
            const b = [
              {},
              {},
              {a:2},
              {b:3},
              {c:4},
              {}
            ]

            var d = odiff(a, b)

            this.eq(d[0].index, 2)
        })
    })

    /*   nah, lets not do filters in this since you can always filter when looping through the changes
    this.test("simple filter", function(t) {
        this.count(7)

        var a = {x:1, y:2, z:3}
        var b = {x:1, y:9, z:3}

        var n=0
        var result = odiff(a,b,function(object, path) {
            n++
            if(n===1) {
                t.eq(path[0], 'x')
                t.eq(object[path[0]], 1)
            } else if(n===2) {
                t.eq(path[0], 'y')
                t.eq(object[path[0]], 9)
                return false // DO filter it
            } else if(n===3) {
                t.eq(path[0], 'z')
                t.eq(object[path[0]], 3)
            } else {
                throw new Error("blah")
            }

            return true // don't filter it out
        })

        t.eq(result.length, 0)
    })

    this.test("nested object filter", function(t) {
        this.count(7)

        var a = {x:[{a:2}]}
        var b = {x:[{a:3}]}

        var n=0
        var result = odiff(a,b,function(object, path) {
            n++
            if(n===1) {
                t.eq(path.length, 1)
                t.eq(path[0], 'x')
                t.eq(object, b)
            } else if(n===2) {
                t.eq(path.length, 3)
                t.eq(path[0], 'x')
                t.eq(path[1], 0)
                t.eq(path[2], 'a')
                t.eq(object, b.x[0])
                return false // DO filter it
            } else {
                throw new Error("blah")
            }

            return true // don't filter it out
        })

        t.eq(result.length, 0)

        console.dir(result)
    })
    */

    //*/

}).writeConsole(2000)

