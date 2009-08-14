Speller
=======

This is a JavaScript implementation of Peter Norvig's statistical spell-checking algorithm. You can read more about the approach in the original article:

[http://norvig.com/spell-correct.html](http://norvig.com/spell-correct.html)

You can see the code in action right inside your browser in the following page:

[http://past.github.com/speller/](http://past.github.com/speller/)

Contents
--------

* spell.js contains the code suitable for execution in a browser environment, with a dependency on [jQuery](http://jquery.com)
* speller.js is a [ServerJS](https://wiki.mozilla.org/ServerJS)-compliant version, that depends on [narwhal](http://narwhaljs.org/)
* speller.html is an HTML file that shows how to use spell.js (you can try it [here](http://past.github.com/speller/))
* spellcheck is a Unix/Linux shell script that shows how to use speller.js
* big.txt is Peter Norvig's original training file, with about a million words
* spelltest.js is a [ServerJS](https://wiki.mozilla.org/ServerJS)-compliant test suite, that uses Norvig's original test cases
* test is a Unix/Linux shell script that runs the tests in spelltest.js

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
