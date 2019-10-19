let currentRow;
let baseMap;

function sendRequest() {
    currentRow = 0;
    baseMap = {};
    let word = document.getElementById("word").value;
    document.getElementById("tbody").innerHTML = "";
    extract(word.trim());
    console.log("Extraction FINISHED");
}

function extract(word) {
    let title = document.getElementById("title");
    let resources = getResources(word);
    title.innerHTML = "<b>Základní tvary pro \'" + word + "\':</b>";
    for (let i = 0; i < resources.length; i++) {
        console.log("Extracting resource: " + resources[i]);
        extractResource(resources[i]);
    }
}

function extractResource(resource) {
    let baseObj = getBase(resource);
    let base = baseObj["base"];
    if (base !== undefined) {
        let pronunciation = getPronunciationElement(getPronunciations(base));
        let pos = getPOS(resource);
        if (pos != null) {
            if (!containsKey(baseMap, base)) {
                appendID('<tr><td><b>' + getLabel(base) + '</b>' + pronunciation + '</td>' +
                    '<td><ul class=\"entries\" id=\"row-' + currentRow + '\"></ul></td></tr>', "tbody");
                baseMap[base] = currentRow++;
            }
            extractPOS(baseObj, resource, pos);
        }
    }
}

function extractPOS(baseObj, res, pos) {
    let posName = getOntoName(pos);
    switch (posName) {
        case "Noun":
            extractNoun(baseObj, res);
            break;
        case "Adjective":
            extractAdjective(baseObj, res);
            break;
        case "Pronoun":
            extractPronoun(baseObj, res);
            break;
        case "Numeral":
            extractNumeral(baseObj, res);
            break;
        case "Verb":
            extractVerb(baseObj, res);
            break;
        case "Adverb":
            extractAdverb(baseObj, res);
            break;
        case "Preposition":
            extractPreposition(baseObj, res);
            break;
        case "Conjunction":
            extractConjunction(baseObj, res);
            break;
        case "Particle":
            extractParticle(baseObj, res);
            break;
        case "Interjection":
            extractInterjection(baseObj, res);
            break;
    }
}

// POS specific functions =============================================================================

function extractNoun(baseObj, res) {
    let level = baseObj["level"];
    let base = baseObj["base"];
    if (level === 1) {
        let query =
            PREFIXES +
            'SELECT ?gen ?an ' +
            'WHERE { ' +
            '    <' + res + '>  l:partOfSpeech l:Noun . ' +
            '    optional {<' + res + '> l:gender  ?gen}' +
            '    optional {<' + res + '> l:animacy ?an}' +
            '    <' + base + '> dbn:describes <' + res + '> .' +
            '}';
        let results = getResults(query);
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                let gen = getValue(result, "gen");
                let an = getValue(result, "an");
                appendEntry(base, toCzech("Noun") + ", " +
                    toCzech(getOntoName(gen)) + " " +
                    toCzech(getOntoName(an)));
            }
        }
    } else if (level === 2) {
        let query =
            PREFIXES +
            'SELECT ?c ?no ?gen ?an ' +
            'WHERE { ' +
            '    <' + res + '>  l:partOfSpeech l:Noun ; ' +
            '                   l:case  ?c ; ' +
            '                   l:number  ?no ; ' +
            '                   l:gender  ?gen .' +
            '    optional {<' + res + '> l:animacy ?an}' +
            '    <' + base + '> dbn:describes ?posRes . ' +
            '    ?posRes lemon:formVariant <' + res + '> . ' +
            '}';
        let results = getResults(query);
        if (results.length === 1) {
            let result = results[0];
            let c = getValue(result, "c");
            let no = getValue(result, "no");
            let gen = getValue(result, "gen");
            let an = getValue(result, "an");
            let genderStr = toCzech(getOntoName(gen));
            if (an !== "") {
                genderStr += " " + toCzech(getOntoName(an));
            }
            appendEntry(base, toCzech("Noun") + ", " +
                genderStr + ", " +
                toCzech(getOntoName(no)) + ", " +
                toCzech(getOntoName(c)) + " pád");
        }
    }
}

function extractAdjective(baseObj, res) {
    let level = baseObj["level"];
    let base = baseObj["base"];
    if (level === 1) {
        appendEntry(base, toCzech("Adjective"));
    } else if (level === 2) {
        if (isCaseForm(res)) {
            let query =
                PREFIXES +
                'SELECT ?c ?type ?no ?gen ?an ' +
                'WHERE { ' +
                '    <' + res + '> l:partOfSpeech      l:Adjective ; ' +
                '    optional {<' + res + '> l:case  ?c} ' +
                '    optional {<' + res + '> l:number  ?no} ' +
                '    optional {<' + res + '> l:gender  ?gen} ' +
                '    optional {<' + res + '> l:animacy ?an}' +
                '    optional {<' + res + '> l:lexTermType ?type}' +
                '    <' + base + '> dbn:describes ?posRes . ' +
                '    ?posRes lemon:formVariant <' + res + '> . ' +
                '}';
            let results = getResults(query);
            if (results.length === 1) {
                let result = results[0];
                let c = getValue(result, "c");
                let no = getValue(result, "no");

                let gen = getValue(result, "gen");
                let an = getValue(result, "an");

                let genderStr = toCzech(getOntoName(gen));
                if (an !== "") {
                    genderStr += " " + toCzech(getOntoName(an));
                }

                let type = getValue(result, "type");
                if (type !== "") {
                    type = "(" + toCzech("short form") + ")";
                }

                appendEntry(base, toCzech("Adjective") + ", " +
                    toCzech(getOntoName(no)) + ", " +
                    genderStr + ", " +
                    toCzech(getOntoName(c)) + " pád " + type);
            }
        } else if (isDegreeForm(res)) {
            let query =
                PREFIXES +
                'SELECT ?deg ' +
                'WHERE { ' +
                '    <' + res + '> l:partOfSpeech      l:Adjective ; ' +
                '    optional {<' + res + '> l:degree ?deg}' +
                '    <' + base + '> dbn:describes ?posRes . ' +
                '    ?posRes lemon:formVariant <' + res + '> . ' +
                '}';
            let results = getResults(query);
            if (results.length === 1) {
                let deg = getValue(results[0], "deg");
                appendEntry(base, toCzech("Adjective") + ", " + toCzech(getOntoName(deg)));
            }
        }
    }
}

function extractPronoun(baseObj, res) {
    let level = baseObj["level"];
    let base = baseObj["base"];
    if (level === 1) {
        let query =
            PREFIXES +
            'SELECT ?gen ?an ' +
            'WHERE { ' +
            '    <' + res + '>  l:partOfSpeech l:Pronoun . ' +
            '    optional {<' + res + '> l:gender  ?gen}' +
            '    optional {<' + res + '> l:animacy ?an}' +
            '    <' + base + '> dbn:describes <' + res + '> .' +
            '}';
        let results = getResults(query);
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                let gen = getValue(result, "gen");
                let an = getValue(result, "an");
                let genderStr = "";
                if (gen !== "") {
                    genderStr += ", " + toCzech(getOntoName(gen));
                    if (an !== "") {
                        genderStr += " " + toCzech(getOntoName(an));
                    }
                }
                appendEntry(base, toCzech("Pronoun") + genderStr);
            }
        }
    } else if (level === 2) {
        if ((isExtendedDeclension(res))) {
            let query =
                PREFIXES +
                'SELECT ?c ?type ?no ?gen ?an ' +
                'WHERE { ' +
                '    <' + res + '> l:partOfSpeech      l:Pronoun ; ' +
                '    optional {<' + res + '> l:case  ?c} ' +
                '    optional {<' + res + '> l:number  ?no} ' +
                '    optional {<' + res + '> l:gender  ?gen} ' +
                '    optional {<' + res + '> l:animacy ?an}' +
                '    optional {<' + res + '> l:lexTermType ?type}' +
                '    <' + base + '> dbn:describes ?posRes . ' +
                '    ?posRes lemon:formVariant <' + res + '> . ' +
                '}';
            let results = getResults(query);
            if (results.length === 1) {
                let result = results[0];
                let c = getValue(result, "c");
                let no = getValue(result, "no");

                let gen = getValue(result, "gen");
                let an = getValue(result, "an");

                let genderStr = toCzech(getOntoName(gen));
                if (an !== "") {
                    genderStr += " " + toCzech(getOntoName(an));
                }

                let type = getValue(result, "type");
                if (type !== "") {
                    type = "(" + toCzech("short form") + ")";
                }

                appendEntry(base, toCzech("Pronoun") + ", " +
                    toCzech(getOntoName(no)) + ", " +
                    genderStr + ", " +
                    toCzech(getOntoName(c)) + " pád " + type);
            }
        } else {
            let query =
                PREFIXES +
                'SELECT ?c ?no ' +
                'WHERE { ' +
                '    <' + res + '>  l:partOfSpeech l:Pronoun ; ' +
                '                   l:case  ?c ; ' +
                '    optional {<' + res + '> l:number  ?no} ' +
                '    <' + base + '> dbn:describes ?posRes . ' +
                '    ?posRes lemon:formVariant <' + res + '> . ' +
                '}';
            let results = getResults(query);
            if (results.length === 1) {
                let result = results[0];
                let no = getValue(result, "no");
                let noStr = "";
                if (no !== "") {
                    noStr = ", " + toCzech(getOntoName(no));
                }
                let c = getValue(result, "c");
                appendEntry(base, toCzech("Pronoun") +
                    noStr + ", " +
                    toCzech(getOntoName(c)) + " pád");
            }
        }
    }
}

function extractNumeral(baseObj, res) {
    let level = baseObj["level"];
    let base = baseObj["base"];
    if (level === 1) {
        let query =
            PREFIXES +
            'SELECT ?no ?gen ?an ' +
            'WHERE { ' +
            '    <' + res + '>  l:partOfSpeech l:Numeral . ' +
            '    optional {<' + res + '> l:gender  ?gen}' +
            '    optional {<' + res + '> l:animacy ?an}' +
            '    optional {<' + res + '> l:number ?no}' +
            '    <' + base + '> dbn:describes <' + res + '> .' +
            '}';
        let results = getResults(query);
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                let no = getValue(result, "no");
                let noStr = "";
                if (no !== "") {
                    noStr = ", " + toCzech(getOntoName(no));
                }
                let gen = getValue(result, "gen");
                let an = getValue(result, "an");
                let genderStr = ", " + toCzech(getOntoName(gen));
                if (an !== "") {
                    genderStr += " " + toCzech(getOntoName(an));
                }
                appendEntry(base, toCzech("Numeral") + noStr + genderStr);
            }
        }
    } else if (level === 2) {
        if ((isExtendedDeclension(res))) {
            let query =
                PREFIXES +
                'SELECT ?c ?type ?no ?gen ?an ' +
                'WHERE { ' +
                '    <' + res + '> l:partOfSpeech      l:Numeral ; ' +
                '    optional {<' + res + '> l:case  ?c} ' +
                '    optional {<' + res + '> l:number  ?no} ' +
                '    optional {<' + res + '> l:gender  ?gen} ' +
                '    optional {<' + res + '> l:animacy ?an}' +
                '    optional {<' + res + '> l:lexTermType ?type}' +
                '    <' + base + '> dbn:describes ?posRes . ' +
                '    ?posRes lemon:formVariant <' + res + '> . ' +
                '}';
            let results = getResults(query);
            if (results.length === 1) {
                let result = results[0];
                let c = getValue(result, "c");
                let no = getValue(result, "no");

                let gen = getValue(result, "gen");
                let an = getValue(result, "an");

                let genderStr = toCzech(getOntoName(gen));
                if (an !== "") {
                    genderStr += " " + toCzech(getOntoName(an));
                }

                let type = getValue(result, "type");
                if (type !== "") {
                    type = "(" + toCzech("short form") + ")";
                }

                appendEntry(base, toCzech("Numeral") + ", " +
                    toCzech(getOntoName(no)) + ", " +
                    genderStr + ", " +
                    toCzech(getOntoName(c)) + " pád " + type);
            }
        } else {
            let query =
                PREFIXES +
                'SELECT ?c ?no ' +
                'WHERE { ' +
                '    <' + res + '>  l:partOfSpeech l:Numeral ; ' +
                '                   l:case  ?c ; ' +
                '    optional {<' + res + '> l:number  ?no} ' +
                '    <' + base + '> dbn:describes ?posRes . ' +
                '    ?posRes lemon:formVariant <' + res + '> . ' +
                '}';
            let results = getResults(query);
            if (results.length === 1) {
                let result = results[0];
                let no = getValue(result, "no");
                let noStr = "";
                if (no !== "") {
                    noStr = toCzech(getOntoName(no)) + ", ";
                }
                let c = getValue(result, "c");
                appendEntry(base, toCzech("Numeral") + ", " +
                    noStr +
                    toCzech(getOntoName(c)) + " pád");
            }
        }
    }
}

function extractVerb(baseObj, res) {
    let level = baseObj["level"];
    let base = baseObj["base"];
    if (level === 1) {
        let query =
            PREFIXES +
            'SELECT ?mood ' +
            'WHERE { ' +
            '    <' + res + '>  l:partOfSpeech l:Verb . ' +
            '    optional {<' + res + '> l:verbFormMood ?mood} ' +
            '    <' + base + '> dbn:describes <' + res + '> .' +
            '}';
        let results = getResults(query);
        if (results.length === 1) {
            let mood = getValue(results[0], "mood");
            let moodStr = "";
            if (mood !== "") {
                moodStr = ", " + toCzech(getOntoName(mood))
            }
            appendEntry(base, toCzech("Verb") + moodStr);
        }
    } else if (level === 2) {
        if (isVerbMood(res)) {
            let query =
                PREFIXES +
                'SELECT ?mood ?tense ?no ?person ' +
                'WHERE { ' +
                '    <' + res + '> l:partOfSpeech  l:Verb ; ' +
                '                  l:verbFormMood  ?mood ;' +
                '                  l:tense         ?tense ;' +
                '                  l:number        ?no ;' +
                '                  l:person        ?person .' +
                '    <' + base + '> dbn:describes ?posRes . ' +
                '    ?posRes lemon:formVariant <' + res + '> . ' +
                '}';
            let results = getResults(query);
            if (results.length === 1) {
                let result = results[0];
                let mood = getValue(result, "mood");
                let tense = getValue(result, "tense");
                let no = getValue(result, "no");
                let person = getValue(result, "person");

                appendEntry(base, toCzech("Verb") + ", " +
                    toCzech(getOntoName(mood)) + ", " +
                    toCzech(getOntoName(tense)) + ", " +
                    toCzech(getOntoName(no)) + ", " +
                    toCzech(getOntoName(person)));
            }
        } else if (isVerbParticiple(res)) {
            let query =
                PREFIXES +
                'SELECT ?voice ?no ?gen ?an ' +
                'WHERE { ' +
                '    <' + res + '> l:partOfSpeech  l:Verb ; ' +
                '                  l:voice         ?voice ;' +
                '                  l:number        ?no ;' +
                '                  l:gender        ?gen ;' +
                '    optional {<' + res + '> l:animacy ?an }' +
                '    <' + base + '> dbn:describes ?posRes . ' +
                '    ?posRes lemon:formVariant <' + res + '> . ' +
                '}';
            let results = getResults(query);
            if (results.length === 1) {
                let result = results[0];
                let voice = getValue(result, "voice");
                let no = getValue(result, "no");
                let gen = getValue(result, "gen");
                let an = getValue(result, "an");
                let genderStr = ", " + toCzech(getOntoName(gen));
                if (an !== "") {
                    genderStr += " " + toCzech(getOntoName(an));
                }

                appendEntry(base, toCzech("Verb") + ", " +
                    toCzech(getOntoName(voice)) + ", " +
                    toCzech(getOntoName(no)) +
                    genderStr);
            }
        } else if (isVerbTransgressive(res)) {
            let query =
                PREFIXES +
                'SELECT ?tense ?no ?gen ?an ' +
                'WHERE { ' +
                '    <' + res + '> l:partOfSpeech        l:Verb ; ' +
                '                  lemon:lexicalVariant  ex-onto:transgressive ;' +
                '                  l:tense               ?tense ;' +
                '                  l:number              ?no ;' +
                '                  l:gender              ?gen ;' +
                '    optional {<' + res + '> l:animacy ?an }' +
                '    <' + base + '> dbn:describes ?posRes . ' +
                '    ?posRes lemon:formVariant <' + res + '> . ' +
                '}';
            let results = getResults(query);
            if (results.length === 1) {
                let result = results[0];
                let tense = getValue(result, "tense");
                let no = getValue(result, "no");
                let gen = getValue(result, "gen");
                let an = getValue(result, "an");
                let genderStr = ", " + toCzech(getOntoName(gen));
                if (an !== "") {
                    genderStr += " " + toCzech(getOntoName(an));
                }

                appendEntry(base, toCzech("Verb") + ", přechodník, " +
                    toCzech(getOntoName(tense)) + ", " +
                    toCzech(getOntoName(no)) +
                    genderStr);
            }
        }
    }
}

function isVerbMood(res) {
    let query =
        PREFIXES +
        'SELECT ?mood ' +
        'WHERE { ' +
        '    <' + res + '> l:verbFormMood ?mood .' +
        '}';
    let results = getResults(query);
    return (results.length === 1);
}

function isVerbParticiple(res) {
    let query =
        PREFIXES +
        'SELECT ?voice ' +
        'WHERE { ' +
        '    <' + res + '> l:voice ?voice .' +
        '}';
    let results = getResults(query);
    return (results.length === 1);
}

function isVerbTransgressive(res) {
    let query =
        PREFIXES +
        'SELECT ?var ' +
        'WHERE { ' +
        '    <' + res + '> lemon:lexicalVariant ?var .' +
        '}';
    let results = getResults(query);
    return (results.length === 1 && getValue(results[0], "var") !== "");
}

function extractAdverb(baseObj, res) {
    let level = baseObj["level"];
    let base = baseObj["base"];
    if (level === 1) {
        appendEntry(base, toCzech("Adverb"));
    } else if (level === 2) {
        let query =
            PREFIXES +
            'SELECT ?deg ' +
            'WHERE { ' +
            '    <' + res + '> l:partOfSpeech      l:Adverb ; ' +
            '    optional {<' + res + '> l:degree ?deg}' +
            '    <' + base + '> dbn:describes ?posRes . ' +
            '    ?posRes lemon:formVariant <' + res + '> . ' +
            '}';
        let results = getResults(query);
        if (results.length === 1) {
            let deg = getValue(results[0], "deg");
            appendEntry(base, toCzech("Adverb") + ", " + toCzech(getOntoName(deg)));
        }
    }
}

function extractPreposition(baseObj, res) {
    let base = baseObj["base"];
    appendEntry(base, toCzech("Preposition"));
}

function extractConjunction(baseObj, res) {
    let base = baseObj["base"];
    appendEntry(base, toCzech("Conjunction"));
}

function extractParticle(baseObj, res) {
    let base = baseObj["base"];
    appendEntry(base, toCzech("Particle"));
}

function extractInterjection(baseObj, res) {
    let base = baseObj["base"];
    appendEntry(base, toCzech("Interjection"));
}

// common functions ===================================================================================

function isCaseForm(res) {
    let query =
        PREFIXES +
        'SELECT ?c' +
        'WHERE { ' +
        '    <' + res + '> l:case ?c .' +
        '}';
    let results = getResults(query);
    return (results.length === 1);
}

function isDegreeForm(res) {
    let query =
        PREFIXES +
        'SELECT ?deg' +
        'WHERE { ' +
        '    <' + res + '> l:degree ?deg .' +
        '}';
    let results = getResults(query);
    return (results.length === 1);
}

function isExtendedDeclension(res) {
    let query =
        PREFIXES +
        'SELECT ?gen' +
        'WHERE { ' +
        '    <' + res + '> l:gender ?gen .' +
        '}';
    let results = getResults(query);
    return (results.length === 1);
}

function getPOS(res) {
    let posQuery =
        PREFIXES +
        'SELECT  ?pos ' +
        'WHERE { ' +
        '    <' + res + '> l:partOfSpeech ?pos . ' +
        '}';
    let results = getResults(posQuery);
    if (results.length > 0) {
        return getValue(results[0], "pos");
    }
    return null;
}

function getPronunciations(base) {
    let pronQuery =
        PREFIXES +
        'SELECT  ?pron ' +
        'WHERE { ' +
        '    <' + base + '> l:pronunciation ?pron . ' +
        '}';
    let results = getResults(pronQuery);
    let pronunciations = [];
    if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            pronunciations.push(results[i]["pron"]["value"]);
        }
    }
    return pronunciations;
}

function getBase(res) {
    let baseQuery =
        PREFIXES +
        'SELECT ?base1 ?base2 ' +
        'WHERE { ' +
        '    optional {' +
        '        ?base1 dbn:describes <' + res + '>' +
        '    } ' +
        '    optional { ' +
        '        ?posRes    lemon:formVariant <' + res + '>.' +
        '        ?base2      dbn:describes      ?posRes . ' +
        '    }' +
        '}';
    let results = getResults(baseQuery);
    let level, base;
    if (results.length === 1) {
        let result = results[0];
        if (containsKey(result, "base1")) {
            level = 1;
            base = getValue(result, "base1");
        } else {
            level = 2;
            base = getValue(result, "base2");
        }
    }
    return {"level": level, "base": base};
}

function getLabel(res) {
    let query =
        PREFIXES +
        'SELECT ?lab ' +
        'WHERE { ' +
        '    <' + res + '> rdfs:label ?lab. ' +
        '}';
    let results = getResults(query);
    return getValue(results[0], "lab");
}

function getResources(word) {
    let resQuery =
        PREFIXES +
        'SELECT ?res ' +
        'WHERE { ' +
        '    ?res rdfs:label \"' + word + '\"@cs ;' +
        '         a          lemon:Word .' +
        '} ';
    let results = getResults(resQuery);
    let resources = [];
    if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            resources.push(getValue(results[i], "res"));
        }
    }
    return resources;
}

function getResults(query) {
    let endpoint = "http://localhost:3030/wiki/sparql";
    let params = "?query=" + encodeURIComponent(query) + "&format=json";

    let result;
    let http = new XMLHttpRequest();
    http.open("GET", endpoint + params, false);
    http.onreadystatechange = function () {
        if (http.readyState === 4) {
            result = http.responseText;
        }
    };
    http.send();
    let results;
    if (result !== undefined) {
        // console.log(result);
        let resultObj = JSON.parse(result);
        results = resultObj["results"]["bindings"];
    }
    if (results === undefined || results === null) {
        results = [];
    }

    return results;
}

// minor functions =====================================================================================

function getResourceName(resource) {
    return resource.substring(resource.lastIndexOf("/") + 1);
}

function getValue(result, key) {
    return (containsKey(result, key))
        ? result[key]["value"]
        : "";
}

function getOntoName(property) {
    return property.substring(property.lastIndexOf("#") + 1);
}

function getPronunciationElement(pronunciations) {
    let pronElement = "";
    if (pronunciations.length > 0) {
        pronElement = " (<i>" + pronunciations.join(" / ") + "</i>):";
    }
    return pronElement;
}

function appendEntry(base, entry) {
    appendID('<li class=\"entry\">' + entry + '</li>', "row-" + baseMap[base]);
}

function appendID(element, id) {
    document.getElementById(id).innerHTML += element;
}

function appendElement(element) {
    document.body.innerHTML += element;
}

function containsKey(object, key) {
    let keyVal = object[key];
    return (keyVal !== undefined);
}

function getCaseOrder(caseName) {
    let no;
    switch (caseName) {
        case "nominativeCase":
            no = 1;
            break;
        case "genitiveCase":
            no = 2;
            break;
        case "dativeCase":
            no = 3;
            break;
        case "accusativeCase":
            no = 4;
            break;
        case "vocativeCase":
            no = 5;
            break;
        case "locativeCase":
            no = 6;
            break;
        case "instrumentalCase":
            no = 7;
            break;
        default:
            no = -1;
            break;
    }
    let caseStr;
    switch (no) {
        case 1:
            caseStr = "" + no + "st";
            break;
        case 2:
            caseStr = "" + no + "nd";
            break;
        case 3:
            caseStr = "" + no + "rd";
            break;
        case -1:
            caseStr = "";
            break;
        default:
            caseStr = "" + no + "th";
            break;
    }
    return caseStr;
}

function toCzech(word) {
    switch (word) {
        case "masculine" :
            return "rod mužský";
        case "feminine" :
            return "rod ženský";
        case "neuter" :
            return "rod střední";
        case "animate" :
            return "životný";
        case "inanimate" :
            return "neživotný";
        case "singular" :
            return "jednotné č.";
        case "plural" :
            return "množné č.";
        case "dual" :
            return "duální č.";
        case "nominativeCase" :
            return "1.";
        case "genitiveCase" :
            return "2.";
        case "dativeCase" :
            return "3.";
        case "accusativeCase" :
            return "4.";
        case "vocativeCase" :
            return "5.";
        case "locativeCase" :
            return "6.";
        case "instrumentalCase" :
            return "7.";
        case "Noun" :
            return "podstatné jméno";
        case "Adjective" :
            return "přídavné jméno";
        case "Pronoun" :
            return "zájmeno";
        case "Numeral" :
            return "číslovka";
        case "Verb" :
            return "sloveso";
        case "Adverb" :
            return "příslovce";
        case "Preposition" :
            return "předložka";
        case "Conjunction" :
            return "spojka";
        case "Particle" :
            return "částice";
        case  "Interjection" :
            return "citoslovce";
        case  "adjective-ý" :
            return "tvrdé";
        case  "adjective-í" :
            return "měkké";
        case "possessiveAdjective" :
            return "přivlastňovací";
        case "shortFormCzech" :
            return "jmenný tvar";
        case "positive" :
            return "1. stupeň";
        case "comparative" :
            return "2. stupeň";
        case "superlative" :
            return "3. stupeň";
        case "firstPerson" :
            return "1. os.";
        case "secondPerson" :
            return "2. os.";
        case "thirdPerson" :
            return "3. os.";
        case  "perfective" :
            return "dokonavé";
        case  "imperfective" :
            return "nedokonavé";
        case  "indicative" :
            return "zp. oznamovací";
        case  "imperative" :
            return "zp. rozkazovací";
        case  "infinitive" :
            return "infinitiv";
        case  "active" :
            return "rod činný";
        case  "passive" :
            return "rod trpný";
        case  "past" :
            return "čas minulý";
        case  "present" :
            return "čas přítomný";
        case  "future" :
            return "čas budoucí";
        case  "IntransitiveFrame" :
            return "nepřechodné";
        case  "TransitiveFrame" :
            return "přechodné";
        case "transgressive":
            return "přechodník";
        default:
            return word;
    }
}

let PREFIXES = "PREFIX ex: <http://www.example.com/> " +
    "PREFIX ex-onto: <http://www.example.com/ontology#> " +
    "PREFIX lemon: <http://lemon-model.net/lemon#> " +
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX wiki: <http://cs.wiktionary.org/wiki/> " +
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
    "PREFIX l: <http://www.lexinfo.net/ontology/2.0/lexinfo#> " +
    "PREFIX dbn: <http://kaiko.getalp.org/dbnary#> ";