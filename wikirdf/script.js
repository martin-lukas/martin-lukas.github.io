function sendRequest() {
    let word = document.getElementById("word").value;
    extract(word.trim());
}

function extract(word) {
    // let output = document.getElementById("output");
    let resources = getResources(word);
    for (let i = 0; i < resources.length; i++) {
        extractResource(resources[i]);
    }
}

function getResources(word) {
    let resQuery =
        PREFIXES +
        'SELECT ?res ' +
        'WHERE { ' +
        '    ?res rdfs:label \"' + word + '\"@cs .' +
        '} ';
    let results = getResults(resQuery);
    let resourceUris = [];
    for (let i = 0; i < results.length; i++) {
        resourceUris.push(results[i]["res"]["value"]);
    }
    return resourceUris;
}

function extractResource(resource) {
    let posQuery =
        PREFIXES +
        'SELECT ?pos ' +
        'WHERE { ' +
        '    <' + resource + '> l:partOfSpeech ?pos .' +
        '} ';
    let results = getResults(posQuery);
    for (let i = 0; i < results.length; i++) {
        choosePOSHandler(resource, results[i]["pos"]["value"]);
    }


}

function choosePOSHandler(resource, posUri) {
    let pos = getLocalName(posUri);
    switch (pos) {
        case "Noun":
            handleNoun(resource);
            break;
        case "Adjective":
            handleAdjective(resource);
            break;
    }
}

function handleNoun(resource) {
    let query =
        PREFIXES +
        'SELECT  ?base ?lab ?gen ?an ' +
        'WHERE {' +
        '    <' + resource + '> l:partOfSpeech      l:Noun ;' +
        '                     l:gender            ?gen ;' +
        '                     rdfs:label          ?lab .' +
        '    optional {<' + resource + '> l:animacy ?an} ' +
        '    ?base            l:formCaseVariant   <' + resource + '>' +
        '}';
    let results = getResults(query);
    console.log(results);
}


function handleAdjective(resource) {
    console.log("Im in handleAdj");

}


function getLocalName(resource) {
    return resource.substring(resource.lastIndexOf("#") + 1);
}

function getResults(query) {
    let endpoint = "http://127.0.0.1:8080/fuseki/wiki/sparql";
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
    let bindings;
    if (result !== undefined) {
        console.log(result);
        bindings = JSON.parse(result)["results"]["bindings"];
        if (bindings !== undefined && bindings !== null) {
            return bindings;
        }
    }
    return [];
}

let PREFIXES = "PREFIX b: <http://www.example.com/ontology#> " +
    "PREFIX lemon: <http://lemon-model.net/lemon#> " +
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX wiki: <http://cs.wiktionary.org/wiki/> " +
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
    "PREFIX l: <http://www.lexinfo.net/ontology/2.0/lexinfo#> ";