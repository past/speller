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

var speller = {};

speller.train = function (filename) {
	var t0 = new Date();
	$.get(filename, null, function(data, textStatus) {
		var t1 = new Date();
		print("Loaded file in " + (t1 - t0) + " msec");
		var lines = data.split("\n");
		lines.forEach(function(line) {
			var m;
			var r = /[a-z]+/g;
			while ((m = r.exec(line.toLowerCase()))) {
				line = m[0];
				speller.nWords[line] = speller.nWords.hasOwnProperty(line) ? speller.nWords[line] + 1 : 1;
			}
		});
		var t2 = new Date();
		print("Trained in " + (t2 - t1) + " msec");
	}, "text");
};

speller.correct = function (word) {
	if (speller.nWords.hasOwnProperty(word)) return word;
	var list = speller.edits(word);
	var candidates = {};
	list.forEach(function(edit) {
		if (speller.nWords.hasOwnProperty(edit)) candidates[speller.nWords[edit]] = edit;
	});
	if (speller.countKeys(candidates) > 0) return candidates[speller.max(candidates)];
	list.forEach(function(edit) {
		speller.edits(edit).forEach(function(w) {
			if (speller.nWords.hasOwnProperty(w)) candidates[speller.nWords[w]] = w;
		});
	});
	return speller.countKeys(candidates) > 0 ? candidates[speller.max(candidates)] : word;
};

speller.countKeys = function(object) {
	var count = 0;
	for (var attr in object)
		if (object.hasOwnProperty(attr))
			count++;
	return count;	
};

speller.max = function(candidates) {
	var arr = [];
	for (var candidate in candidates)
		if (candidates.hasOwnProperty(candidate))
			arr.push(candidate);
	return Math.max.apply(null, arr);
};

speller.nWords = {};

speller.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

speller.edits = function (word) {
	var results = [];
	// deletion
	for (var i=0; i < word.length; i++)
	    results.push(word.slice(0, i) + word.slice(i+1));
	// transposition
	for (i=0; i < word.length-1; i++)
	    results.push(word.slice(0, i) + word.slice(i+1, i+2) + word.slice(i, i+1) + word.slice(i+2));
	// alteration
	for (i=0; i < word.length; i++)
	    speller.alphabet.forEach(function(c) {
	        results.push(word.slice(0, i) + c + word.slice(i+1));
		});
	// insertion
	for (i=0; i <= word.length; i++)
	    speller.alphabet.forEach(function(c) {
	        results.push(word.slice(0, i) + c + word.slice(i));
		});
	return results;
};

