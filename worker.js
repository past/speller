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
 * This file is the concatenation of speller.js, spelltest.js, json2.js and the
 * worker controller function. Since Web Workers cannot load code from external
 * libraries, I have manually bundled the necessary code together with simple
 * copy & paste.
 */

// The worker control function.
onmessage = function (e) {
    var message = e.data.split("@");
    speller.nWords = JSON.parse(message[1]);
	postMessage(JSON.stringify(spelltest.test(spelltest[message[0]])));
};

/*** speller.js ***/

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
	var m, r = /[a-z]+/g;
	while ((m = r.exec(text.toLowerCase()))) {
		text = m[0];
		speller.nWords[text] = speller.nWords.hasOwnProperty(text) ? speller.nWords[text] + 1 : 1;
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

/*** spelltest.js ***/

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

var spelltest = {};

// Dummy initializer for non-ServerJS environments.
var exports;
if (!exports) exports = {};
var require;
if (!require) require = {};

var speller;
if (!speller) speller = require('./speller');

// A function that tests the speller against the supplied map of tests.
exports.test = spelltest.test = function (tests, bias, verbose) {
    var n = 0;
    var bad = 0;
    var unknown = 0;
    var start = new Date();
    if (bias)
        for (var target in tests)
            if (tests.hasOwnProperty(target))
                speller.nWords[target] += bias;
    for (target in tests)
        if (tests.hasOwnProperty(target)) {
            var wrongs = tests[target];
            wrongs.split(/\s+/).forEach(function(wrong) {
                n++;
                var w = speller.correct(wrong);
                if (w != target) {
                    bad++;
                    if (!speller.nWords.hasOwnProperty(target))
                        unknown++;
                    if (verbose) {
                        var wCount = speller.nWords[w] || 1;
                        var targetCount = speller.nWords[target] || 1;
                        print("correct(" + wrong + ") => " + w + " (" + wCount +
                              "); expected " + target + " (" + targetCount + ")");
                    }
                }
            });
        }
    return {"bad": bad, "n": n, "bias": bias, "pct": ((100-100*bad/n)).toFixed(0),
            "unknown": unknown, "secs": ((new Date()-start)/1000).toFixed(0)};
};

// The first set of tests. Keys are the correct words, while values are the wrong ones.
exports.tests1 = spelltest.tests1 = { 'access': 'acess', 'accessing': 'accesing', 'accommodation':
'accomodation acommodation acomodation', 'account': 'acount', 'address':
'adress adres', 'addressable': 'addresable', 'arranged': 'aranged arrainged',
'arrangeing': 'aranging', 'arrangement': 'arragment', 'articles': 'articals',
'aunt': 'annt anut arnt', 'auxiliary': 'auxillary', 'available': 'avaible',
'awful': 'awfall afful', 'basically': 'basicaly', 'beginning': 'begining',
'benefit': 'benifit', 'benefits': 'benifits', 'between': 'beetween', 'bicycle':
'bicycal bycicle bycycle', 'biscuits': 
'biscits biscutes biscuts bisquits buiscits buiscuts', 'built': 'biult', 
'cake': 'cak', 'career': 'carrer',
'cemetery': 'cemetary semetary', 'centrally': 'centraly', 'certain': 'cirtain',
'challenges': 'chalenges chalenges', 'chapter': 'chaper chaphter chaptur',
'choice': 'choise', 'choosing': 'chosing', 'clerical': 'clearical',
'committee': 'comittee', 'compare': 'compair', 'completely': 'completly',
'consider': 'concider', 'considerable': 'conciderable', 'contented':
'contenpted contende contended contentid', 'curtains': 
'cartains certans courtens cuaritains curtans curtians curtions', 'decide': 'descide', 'decided':
'descided', 'definitely': 'definately difinately', 'definition': 'defenition',
'definitions': 'defenitions', 'description': 'discription', 'desiccate':
'desicate dessicate dessiccate', 'diagrammatically': 'diagrammaticaally',
'different': 'diffrent', 'driven': 'dirven', 'ecstasy': 'exstacy ecstacy',
'embarrass': 'embaras embarass', 'establishing': 'astablishing establising',
'experience': 'experance experiance', 'experiences': 'experances', 'extended':
'extented', 'extremely': 'extreamly', 'fails': 'failes', 'families': 'familes',
'february': 'febuary', 'further': 'futher', 'gallery': 'galery gallary gallerry gallrey', 
'hierarchal': 'hierachial', 'hierarchy': 'hierchy', 'inconvenient':
'inconvienient inconvient inconvinient', 'independent': 'independant independant',
'initial': 'intial', 'initials': 'inetials inistals initails initals intials',
'juice': 'guic juce jucie juise juse', 'latest': 'lates latets latiest latist', 
'laugh': 'lagh lauf laught lugh', 'level': 'leval',
'levels': 'levals', 'liaison': 'liaision liason', 'lieu': 'liew', 'literature':
'litriture', 'loans': 'lones', 'locally': 'localy', 'magnificent': 
'magnificnet magificent magnifcent magnifecent magnifiscant magnifisent magnificant',
'management': 'managment', 'meant': 'ment', 'minuscule': 'miniscule',
'minutes': 'muinets', 'monitoring': 'monitering', 'necessary': 
'neccesary necesary neccesary necassary necassery neccasary', 'occurrence':
'occurence occurence', 'often': 'ofen offen offten ofton', 'opposite': 
'opisite oppasite oppesite oppisit oppisite opposit oppossite oppossitte', 'parallel': 
'paralel paralell parrallel parralell parrallell', 'particular': 'particulaur',
'perhaps': 'perhapse', 'personnel': 'personnell', 'planned': 'planed', 'poem':
'poame', 'poems': 'poims pomes', 'poetry': 'poartry poertry poetre poety powetry', 
'position': 'possition', 'possible': 'possable', 'pretend': 
'pertend protend prtend pritend', 'problem': 'problam proble promblem proplen',
'pronunciation': 'pronounciation', 'purple': 'perple perpul poarple',
'questionnaire': 'questionaire', 'really': 'realy relley relly', 'receipt':
'receit receite reciet recipt', 'receive': 'recieve', 'refreshment':
'reafreshment refreshmant refresment refressmunt', 'remember': 'rember remeber rememmer rermember',
'remind': 'remine remined', 'scarcely': 'scarcly scarecly scarely scarsely', 
'scissors': 'scisors sissors', 'separate': 'seperate',
'singular': 'singulaur', 'someone': 'somone', 'sources': 'sorces', 'southern':
'southen', 'special': 'speaical specail specal speical', 'splendid': 
'spledid splended splened splended', 'standardizing': 'stanerdizing', 'stomach': 
'stomac stomache stomec stumache', 'supersede': 'supercede superceed', 'there': 'ther',
'totally': 'totaly', 'transferred': 'transfred', 'transportability':
'transportibility', 'triangular': 'triangulaur', 'understand': 'undersand undistand', 
'unexpected': 'unexpcted unexpeted unexspected', 'unfortunately':
'unfortunatly', 'unique': 'uneque', 'useful': 'usefull', 'valuable': 'valubale valuble', 
'variable': 'varable', 'variant': 'vairiant', 'various': 'vairious',
'visited': 'fisited viseted vistid vistied', 'visitors': 'vistors',
'voluntary': 'volantry', 'voting': 'voteing', 'wanted': 'wantid wonted',
'whether': 'wether', 'wrote': 'rote wote'};

// The second set of tests. Keys are the correct words, while values are the wrong ones.
exports.tests2 = spelltest.tests2 = {'forbidden': 'forbiden', 'decisions': 'deciscions descisions',
'supposedly': 'supposidly', 'embellishing': 'embelishing', 'technique':
'tecnique', 'permanently': 'perminantly', 'confirmation': 'confermation',
'appointment': 'appoitment', 'progression': 'progresion', 'accompanying':
'acompaning', 'applicable': 'aplicable', 'regained': 'regined', 'guidelines':
'guidlines', 'surrounding': 'serounding', 'titles': 'tittles', 'unavailable':
'unavailble', 'advantageous': 'advantageos', 'brief': 'brif', 'appeal':
'apeal', 'consisting': 'consisiting', 'clerk': 'cleark clerck', 'component':
'componant', 'favourable': 'faverable', 'separation': 'seperation', 'search':
'serch', 'receive': 'recieve', 'employees': 'emploies', 'prior': 'piror',
'resulting': 'reulting', 'suggestion': 'sugestion', 'opinion': 'oppinion',
'cancellation': 'cancelation', 'criticism': 'citisum', 'useful': 'usful',
'humour': 'humor', 'anomalies': 'anomolies', 'would': 'whould', 'doubt':
'doupt', 'examination': 'eximination', 'therefore': 'therefoe', 'recommend':
'recomend', 'separated': 'seperated', 'successful': 'sucssuful succesful',
'apparent': 'apparant', 'occurred': 'occureed', 'particular': 'paerticulaur',
'pivoting': 'pivting', 'announcing': 'anouncing', 'challenge': 'chalange',
'arrangements': 'araingements', 'proportions': 'proprtions', 'organized':
'oranised', 'accept': 'acept', 'dependence': 'dependance', 'unequalled':
'unequaled', 'numbers': 'numbuers', 'sense': 'sence', 'conversely':
'conversly', 'provide': 'provid', 'arrangement': 'arrangment',
'responsibilities': 'responsiblities', 'fourth': 'forth', 'ordinary':
'ordenary', 'description': 'desription descvription desacription',
'inconceivable': 'inconcievable', 'data': 'dsata', 'register': 'rgister',
'supervision': 'supervison', 'encompassing': 'encompasing', 'negligible':
'negligable', 'allow': 'alow', 'operations': 'operatins', 'executed':
'executted', 'interpretation': 'interpritation', 'hierarchy': 'heiarky',
'indeed': 'indead', 'years': 'yesars', 'through': 'throut', 'committee':
'committe', 'inquiries': 'equiries', 'before': 'befor', 'continued':
'contuned', 'permanent': 'perminant', 'choose': 'chose', 'virtually':
'vertually', 'correspondence': 'correspondance', 'eventually': 'eventully',
'lonely': 'lonley', 'profession': 'preffeson', 'they': 'thay', 'now': 'noe',
'desperately': 'despratly', 'university': 'unversity', 'adjournment':
'adjurnment', 'possibilities': 'possablities', 'stopped': 'stoped', 'mean':
'meen', 'weighted': 'wagted', 'adequately': 'adequattly', 'shown': 'hown',
'matrix': 'matriiix', 'profit': 'proffit', 'encourage': 'encorage', 'collate':
'colate', 'disaggregate': 'disaggreagte disaggreaget', 'receiving':
'recieving reciving', 'proviso': 'provisoe', 'umbrella': 'umberalla', 'approached':
'aproached', 'pleasant': 'plesent', 'difficulty': 'dificulty', 'appointments':
'apointments', 'base': 'basse', 'conditioning': 'conditining', 'earliest':
'earlyest', 'beginning': 'begining', 'universally': 'universaly',
'unresolved': 'unresloved', 'length': 'lengh', 'exponentially':
'exponentualy', 'utilized': 'utalised', 'set': 'et', 'surveys': 'servays',
'families': 'familys', 'system': 'sysem', 'approximately': 'aproximatly',
'their': 'ther', 'scheme': 'scheem', 'speaking': 'speeking', 'repetitive':
'repetative', 'inefficient': 'ineffiect', 'geneva': 'geniva', 'exactly':
'exsactly', 'immediate': 'imediate', 'appreciation': 'apreciation', 'luckily':
'luckeley', 'eliminated': 'elimiated', 'believe': 'belive', 'appreciated':
'apreciated', 'readjusted': 'reajusted', 'were': 'wer where', 'feeling':
'fealing', 'and': 'anf', 'false': 'faulse', 'seen': 'seeen', 'interrogating':
'interogationg', 'academically': 'academicly', 'relatively': 'relativly relitivly',
'traditionally': 'traditionaly', 'studying': 'studing',
'majority': 'majorty', 'build': 'biuld', 'aggravating': 'agravating',
'transactions': 'trasactions', 'arguing': 'aurguing', 'sheets': 'sheertes',
'successive': 'sucsesive sucessive', 'segment': 'segemnt', 'especially':
'especaily', 'later': 'latter', 'senior': 'sienior', 'dragged': 'draged',
'atmosphere': 'atmospher', 'drastically': 'drasticaly', 'particularly':
'particulary', 'visitor': 'vistor', 'session': 'sesion', 'continually':
'contually', 'availability': 'avaiblity', 'busy': 'buisy', 'parameters':
'perametres', 'surroundings': 'suroundings seroundings', 'employed':
'emploied', 'adequate': 'adiquate', 'handle': 'handel', 'means': 'meens',
'familiar': 'familer', 'between': 'beeteen', 'overall': 'overal', 'timing':
'timeing', 'committees': 'comittees commitees', 'queries': 'quies',
'econometric': 'economtric', 'erroneous': 'errounous', 'decides': 'descides',
'reference': 'refereence refference', 'intelligence': 'inteligence',
'edition': 'ediion ediition', 'are': 'arte', 'apologies': 'appologies',
'thermawear': 'thermawere thermawhere', 'techniques': 'tecniques',
'voluntary': 'volantary', 'subsequent': 'subsequant subsiquent', 'currently':
'curruntly', 'forecast': 'forcast', 'weapons': 'wepons', 'routine': 'rouint',
'neither': 'niether', 'approach': 'aproach', 'available': 'availble',
'recently': 'reciently', 'ability': 'ablity', 'nature': 'natior',
'commercial': 'comersial', 'agencies': 'agences', 'however': 'howeverr',
'suggested': 'sugested', 'career': 'carear', 'many': 'mony', 'annual':
'anual', 'according': 'acording', 'receives': 'recives recieves',
'interesting': 'intresting', 'expense': 'expence', 'relevant':
'relavent relevaant', 'table': 'tasble', 'throughout': 'throuout', 'conference':
'conferance', 'sensible': 'sensable', 'described': 'discribed describd',
'union': 'unioun', 'interest': 'intrest', 'flexible': 'flexable', 'refered':
'reffered', 'controlled': 'controled', 'sufficient': 'suficient',
'dissension': 'desention', 'adaptable': 'adabtable', 'representative':
'representitive', 'irrelevant': 'irrelavent', 'unnecessarily': 'unessasarily',
'applied': 'upplied', 'apologised': 'appologised', 'these': 'thees thess',
'choices': 'choises', 'will': 'wil', 'procedure': 'proceduer', 'shortened':
'shortend', 'manually': 'manualy', 'disappointing': 'dissapoiting',
'excessively': 'exessively', 'comments': 'coments', 'containing': 'containg',
'develop': 'develope', 'credit': 'creadit', 'government': 'goverment',
'acquaintances': 'aquantences', 'orientated': 'orentated', 'widely': 'widly',
'advise': 'advice', 'difficult': 'dificult', 'investigated': 'investegated',
'bonus': 'bonas', 'conceived': 'concieved', 'nationally': 'nationaly',
'compared': 'comppared compased', 'moving': 'moveing', 'necessity':
'nessesity', 'opportunity': 'oppertunity oppotunity opperttunity', 'thoughts':
'thorts', 'equalled': 'equaled', 'variety': 'variatry', 'analysis':
'analiss analsis analisis', 'patterns': 'pattarns', 'qualities': 'quaties', 'easily':
'easyly', 'organization': 'oranisation oragnisation', 'the': 'thw hte thi',
'corporate': 'corparate', 'composed': 'compossed', 'enormously': 'enomosly',
'financially': 'financialy', 'functionally': 'functionaly', 'discipline':
'disiplin', 'announcement': 'anouncement', 'progresses': 'progressess',
'except': 'excxept', 'recommending': 'recomending', 'mathematically':
'mathematicaly', 'source': 'sorce', 'combine': 'comibine', 'input': 'inut',
'careers': 'currers carrers', 'resolved': 'resoved', 'demands': 'diemands',
'unequivocally': 'unequivocaly', 'suffering': 'suufering', 'immediately':
'imidatly imediatly', 'accepted': 'acepted', 'projects': 'projeccts',
'necessary': 'necasery nessasary nessisary neccassary', 'journalism':
'journaism', 'unnecessary': 'unessessay', 'night': 'nite', 'output':
'oputput', 'security': 'seurity', 'essential': 'esential', 'beneficial':
'benificial benficial', 'explaining': 'explaning', 'supplementary':
'suplementary', 'questionnaire': 'questionare', 'employment': 'empolyment',
'proceeding': 'proceding', 'decision': 'descisions descision', 'per': 'pere',
'discretion': 'discresion', 'reaching': 'reching', 'analysed': 'analised',
'expansion': 'expanion', 'although': 'athough', 'subtract': 'subtrcat',
'analysing': 'aalysing', 'comparison': 'comparrison', 'months': 'monthes',
'hierarchal': 'hierachial', 'misleading': 'missleading', 'commit': 'comit',
'auguments': 'aurgument', 'within': 'withing', 'obtaining': 'optaning',
'accounts': 'acounts', 'primarily': 'pimarily', 'operator': 'opertor',
'accumulated': 'acumulated', 'extremely': 'extreemly', 'there': 'thear',
'summarys': 'sumarys', 'analyse': 'analiss', 'understandable':
'understadable', 'safeguard': 'safegaurd', 'consist': 'consisit',
'declarations': 'declaratrions', 'minutes': 'muinutes muiuets', 'associated':
'assosiated', 'accessibility': 'accessability', 'examine': 'examin',
'surveying': 'servaying', 'politics': 'polatics', 'annoying': 'anoying',
'again': 'agiin', 'assessing': 'accesing', 'ideally': 'idealy', 'scrutinized':
'scrutiniesed', 'simular': 'similar', 'personnel': 'personel', 'whereas':
'wheras', 'when': 'whn', 'geographically': 'goegraphicaly', 'gaining':
'ganing', 'requested': 'rquested', 'separate': 'seporate', 'students':
'studens', 'prepared': 'prepaired', 'generated': 'generataed', 'graphically':
'graphicaly', 'suited': 'suted', 'variable': 'varible vaiable', 'building':
'biulding', 'required': 'reequired', 'necessitates': 'nessisitates',
'together': 'togehter', 'profits': 'proffits'};

/*** json2.js ***/

/*
    http://www.JSON.org/json2.js
    2009-06-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON = JSON || {};

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
