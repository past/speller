Speller
=======

This is a JavaScript implementation of Peter Norvig's statistical spell-checking
algorithm. You can read more about the approach in the original article:

[http://norvig.com/spell-correct.html](http://norvig.com/spell-correct.html)

The code is [CommonJS](http://commonjs.org/)-compliant, so it can be
used both inside and outside of a web browser. For the latter case there are a
couple of command-line scripts demonstrating its use that depend on
[narwhal](http://narwhaljs.org/) or [node](http://nodejs.org/). You may use the
tusk and [npm](http://npmjs.org) package managers to install speller on narwhal
and node, respectively. Alternatively, you can see the code in action right
inside your browser in the following page:

[http://past.github.com/speller/](http://past.github.com/speller/)

Contents
--------

* lib/speller.js is the spell-checker implementation 
* demo/speller.html is an HTML file that shows how to use speller.js (you can try it [here](http://past.github.com/speller/))
* bin/spellcheck is a Unix/Linux shell script, that depends on [narwhal](http://narwhaljs.org/) and shows how to use speller.js outside the browser
* bin/speller is a Unix/Linux shell script, that depends on [node](http://nodejs.org/) and shows how to use speller.js outside the browser
* bin/big.txt is Peter Norvig's original training file, with about a million words
* tests/spelltest.js is a [CommonJS](http://commonjs.org/)-compliant test suite, that uses Norvig's original test cases
* tests/test is a Unix/Linux shell script, that depends on [narwhal](http://narwhaljs.org/) and runs the tests in spelltest.js
* tests/test-node is a Unix/Linux shell script, that depends on [node](http://nodejs.org/) and runs the tests in spelltest.js
* demo/worker.js is a [Web Worker](http://www.whatwg.org/specs/web-workers/current-work/) that allows the tests in spelltest.js to run inside a browser

License
-------

Copyright (c) 2009 Panagiotis Astithas

Permission to use, copy, modify, and distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
