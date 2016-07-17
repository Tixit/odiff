
`odiff`
=====

A value difference generator that can generate a list of differences between one javascript value and another. It recursively finds differences
within arrays and objects.

Example
=======

```javascript
var a = [{a:1,b:2,c:3},              {x:1,y: 2, z:3},              {w:9,q:8,r:7}]
var b = [{a:1,b:2,c:3},{t:4,y:5,u:6},{x:1,y:'3',z:3},{t:9,y:9,u:9},{w:9,q:8,r:7}]

var diffs = odiff(a,b)

/* diffs now contains:
[{type: 'add', path:[], index: 2, vals: [{t:9,y:9,u:9}]},
 {type: 'set', path:[1,'y'], val: '3'},
 {type: 'add', path:[], index: 1, vals: [{t:4,y:5,u:6}]}
]
*/
```

Motivation
==========

This differencing algorithm is intended to make object differences easy to manage when you need to update an object in a way other
than simply copying the reference. An example is if you need to create a database query to update a record based on the changes between
two objects. It also works in a basic way on primitives (no string differencing tho).

While this algorithm puts in some effort to make the number of change records minimal, it by no means generates an absolutely minimal set
of changes. It also doesn't handle compressing string differences in any way. For these reasons, this algorithm is not ideal for use in
sending changes over the wire, especially if your data contains lots of small changes to large strings.

Other algorithms I found either had undesirable behavior when dealing with array inserts
( [flitbit/diff](https://github.com/flitbit/diff), [cosmicanant/recursive-diff](https://github.com/cosmicanant/recursive-diff),
[ackrause/ObjectCompare](https://github.com/ackrause/ObjectCompare), [thomseddon/docdiff](https://github.com/thomseddon/docdiff) ),
had weird nested difference formats that make things harder ( [NV/objectDiff.js](https://github.com/NV/objectDiff.js) ), didn't describe their behavior at all ( [aogriffiths/jsondiff-js](https://github.com/aogriffiths/jsondiff-js),
[benjamine/JsonDiffPatch](https://github.com/benjamine/JsonDiffPatch) ), or all three.
Also some only work on objects (not arrays) ( [Evaw/objectDiff](https://github.com/Evaw/objectDiff), [omgaz/js-diff](https://github.com/omgaz/js-diff) ).

Install
=======

```
npm install odiff
```


Usage
=====

Accessing odiff:
```javascript
// node.js
var odiff = require('odiff')

// amd
require.config({paths: {odiff: '../generatedBuilds/odiff.umd.js'}})
require(['odiff'], function(odiff) { /* your code */ })

// global variable
<script src="odiff.umd.js"></script>
odiff; // odiff.umd.js can define odiff globally if you really
       //   want to shun module-based design
```

Using odiff:

**`odiff(valueA, valueB)`** - Returns an array of changes that, when applied to valueA, will turn that value into valueB. The results are also
build such that you can pick and choose what changes to do, and as long as you do them (selectively) in order, the changes will work properly.
Each element in the resulting array has the following members:
* `type` - Either `"set"`, `"add"`,  or `"rm"`
* `path` - An array representing the path from the root object. For example, `["a",2,"b"]` represents `valueA.a[2].b`. Will be an empty
array if the change applies to the top-level object (ie `valueA` directly).
* `val` - The value the indicated property was changed to. Only defined for the `"set"` type.
* `index` - The index at which an item was added or removed from an array. Only defined for the `"add"` and `"rm"` types.
* `vals` - An array of values added into the indicated property. Only defined for the `"add"` type.
* `num` - The number of items removed from the indicated property. Only defined for the `"remove"` type.

Odiff also exposes two functions used internally:

**`odiff.equal(a,b)`** - Returns true if the two values are equal, false otherwise. `NaN` is treated as equal to itself.

**`odiff.similar(a,b)`** - Returns true if the two values are similar, false otherwise. "Similar" is defined as having less than two shallow
inner values different (as long as not 100% of the values are different) or having fewer than 10% of its shallow values different.
`NaN` is treated as equal to itself.

### Algorithm behavior

The differencing algorithm is intended to run well on values that are pretty similar. Some properties of the algorithm:
* If a value is inserted into or removed from the middle of an array, the algorithm should generate an 'add' change item, rather than a
string of 'set' change items
* If an array element is changed only a little bit, a sequence of change items is generated to change that element. A "little bit"
is defined as less than two shallow inner values being changed or fewer than 10% of its shallow values being changed.
* If an array element is changed a lot (defined as the opposite of "a little bit" above), a single change items will be generated to reset
that complex value. This is intended as a trade off between number of changes and "size" of each change.
* The change items are ordered such that if you apply the changes as written to `valueA` in order, you will get `valueB`. It does this by
reversing the order in which array changes are listed.
* The 3 types of values the algorithm recognizes are Objects, Arrays, and atomic primitives. Only Objects and Arrays are recursively analyzed.
* Strings and numbers are treated as atomic primitives - if a string changes one character, that whole value will be written in the `value`
key of the change item.
* NaN is treated as equal to itself for the purposes of this difference.
* Objects with circular references aren't supported (yet)

Design Decisions
================

### Why not use JSONPatch format?

* The JSON Pointer format uses weird escape codes, I assume because doing that saves a couple bytes here and there
* The remove item can't specify a count, so if you remove a big sequence from an array, you get a ton of little removal events (strange since this totally negates the bytes saved by JSON Pointer)

Todo
======

* Use [object-traverse](https://github.com/nervgh/object-traverse) to refactor - mostly because it supports circular reference detection


How to Contribute!
============

Anything helps:

* Creating issues (aka tickets/bugs/etc). Please feel free to use issues to report bugs, request features, and discuss changes
* Updating the documentation: ie this readme file. Be bold! Help create amazing documentation!
* Submitting pull requests.

How to submit pull requests:

1. Please create an issue and get my input before spending too much time creating a feature. Work with me to ensure your feature or addition is optimal and fits with the purpose of the project.
2. Fork the repository
3. clone your forked repo onto your machine and run `npm install` at its root
4. If you're gonna work on multiple separate things, its best to create a separate branch for each of them
5. edit!
6. If it's a code change, please add to the unit tests (at test/odiffTest.js) to verify that your change
7. When you're done, run the unit tests and ensure they all pass
8. Commit and push your changes
9. Submit a pull request: https://help.github.com/articles/creating-a-pull-request

Change Log
=========

* 0.0.2 - fixing bug related to isNaN being garbage
* 0.0.1 - first commit!

License
=======
Released under the MIT license: http://opensource.org/licenses/MIT