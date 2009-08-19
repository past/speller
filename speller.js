/* -*- mode: JavaScript; c-basic-offset: 4; tab-width: 4; indent-tabs-mode: nil -*- */
/* ex: set tabstop=4 expandtab: */
/*
 * Copyright (c) 2009 Panagiotis Astithas
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/*
 * A spell-checker based on the statistical algorithm described by Peter Norvig
 * in http://norvig.com/spell-correct.html
 *
 * Usage requires a two-step process:
 * 1) call speller.train() one or more times with a large text to train the language model
 * 2) call speller.correct(word) to retrieve the correction for the specified word
 */

var speller = {};

// Dummy initializer for non-ServerJS environments.
var exports;
if (!exports) exports = {};

// A function that trains the language model with the words in the supplied text.
// Multiple invocation of this function can extend the training of the model.
exports.train = speller.train = function (text) {
	var word, m, r = /[a-z]+/g;
	text = text.toLowerCase();
	while ((m = r.exec(text))) {
		word = m[0];
		speller.nWords[word] = speller.nWords.hasOwnProperty(word) ? speller.nWords[word] + 1 : 1;
	}
};

// A function that returns the correction for the specified word.
exports.correct = speller.correct = function (word) {
	if (speller.nWords.hasOwnProperty(word)) return word;
	var candidates = {}, list = speller.edits(word);
	list.forEach(function (edit) {
		if (speller.nWords.hasOwnProperty(edit)) candidates[speller.nWords[edit]] = edit;
	});
	if (speller.countKeys(candidates) > 0) return candidates[speller.max(candidates)];
	list.forEach(function (edit) {
		speller.edits(edit).forEach(function (w) {
			if (speller.nWords.hasOwnProperty(w)) candidates[speller.nWords[w]] = w;
		});
	});
	return speller.countKeys(candidates) > 0 ? candidates[speller.max(candidates)] : word;
};

// A map of words to the number of times they were encountered during training.
// This is exported only for the benefit of spelltest.js.
exports.nWords = speller.nWords = {};

// A helper function that counts the keys in the supplied object.
speller.countKeys = function (object) {
	var attr, count = 0;
	for (attr in object)
		if (object.hasOwnProperty(attr))
			count++;
	return count;	
};

// A helper function that returns the word with the most occurences in the language
// model, among the supplied candidates.
speller.max = function (candidates) {
	var candidate, arr = [];
	for (candidate in candidates)
		if (candidates.hasOwnProperty(candidate))
			arr.push(candidate);
	return Math.max.apply(null, arr);
};

speller.letters = "abcdefghijklmnopqrstuvwxyz".split("");

// A function that returns the set of possible corrections of the specified word.
// The edits can be deletions, insertions, alterations or transpositions.
speller.edits = function (word) {
	var i, results = [];
	// deletion
	for (i=0; i < word.length; i++)
	    results.push(word.slice(0, i) + word.slice(i+1));
	// transposition
	for (i=0; i < word.length-1; i++)
	    results.push(word.slice(0, i) + word.slice(i+1, i+2) + word.slice(i, i+1) + word.slice(i+2));
	// alteration
	for (i=0; i < word.length; i++)
	    speller.letters.forEach(function (l) {
	        results.push(word.slice(0, i) + l + word.slice(i+1));
		});
	// insertion
	for (i=0; i <= word.length; i++)
	    speller.letters.forEach(function (l) {
	        results.push(word.slice(0, i) + l + word.slice(i));
		});
	return results;
};
