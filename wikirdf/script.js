function sendRequest() {
    let word = document.getElementById("word").value;
    extract(word.trim());
}

function extract(word) {
    let resources = getResources(word);
    for (let i = 0; i < resources.length; i++) {
        extractResource(resources[i]);
    }
}

function extractResource(resUri) {
    let base = getBase(resUri);
    let pronunciation = getPronunciationElement(getPronunciations(base));

    if (base != null) {
        appendElement('<div>' + base + pronunciation + '</div>');
    }
}

function getPOS(resName) {
    let posQuery =
        PREFIXES +
        'SELECT  ?pos ' +
        'WHERE { ' +
        '    b:' + resName + ' l:partOfSpeech ?pos . ' +
        '}';
    let results = getResults(posQuery);
    if (results.length > 0) {
        return results["pos"];
    }
    return null;
}

function getPronunciationElement(pronunciations) {
    let pronElement = "";
    if (pronunciations > 0) {
        pronElement = " (" + pronunciations.join(" / ") + "):";
    }
    return pronElement;
}

function getBase(res) {
    let baseQuery =
        PREFIXES +
        'SELECT ?base ' +
        'WHERE { ' +
        '    optional {' +
        '        ?base dbn:describes <' + res + '>' +
        '    } ' +
        '    optional { ' +
        '        ?posRes    lemon:formVariant <' + res + ">." +
        '        ?base      dbn:describes      ?posRes . ' +
        '    }' +
        '}';
    let results = getResults(baseQuery);
    if (results.length === 1) {
        return results[0]["base"]["value"];
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
    if (results.length > 0) {
        return results["pron"];
    }
    return [];
}

function getNounBase(res) {
    let query =
        PREFIXES +
        'SELECT  ?base ?lab ?gen ?an ' +
        'WHERE {' +
        '' +
        '}';
    let results = getResults(query);
}

function getPropertyName(property) {
    return property.substring(property.lastIndexOf("#") + 1);
}

function getResourceName(resource) {
    return resource.substring(resource.lastIndexOf("/") + 1);
}

function getResources(word) {
    let resQuery =
        PREFIXES +
        'SELECT ?res ' +
        'WHERE { ' +
        '    ?res rdfs:label \"' + word + '\"@cs ;' +
        '         a          lemon:LexicalEntry .' +
        '} ';
    let results = getResults(resQuery);
    let resources = [];
    if (results !== undefined) {
        for (let i = 0; i < results.length; i++) {
            resources.push(results[i]["res"]["value"]);
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

function appendElement(element) {
    document.body.innerHTML += element;
}

let PREFIXES = "PREFIX b: <http://www.example.com/> " +
    "PREFIX onto: <http://www.example.com/ontology#> " +
    "PREFIX lemon: <http://lemon-model.net/lemon#> " +
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX wiki: <http://cs.wiktionary.org/wiki/> " +
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
    "PREFIX l: <http://www.lexinfo.net/ontology/2.0/lexinfo#> " +
    "PREFIX dbn: <http://kaiko.getalp.org/dbnary#> ";