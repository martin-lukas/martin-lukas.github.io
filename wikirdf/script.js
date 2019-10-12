function sendRequest() {
    let word = document.getElementById("word").value;
    cleanInput(word);
}

function cleanInput(word) {
    extract(word.trim());
}

function extract(word) {
    let output = document.getElementById("output");
    let posQuery =
        PREFIXES +
        'SELECT ?pos ' +
        'WHERE { ' +
        '    ?res rdfs:label \"' + word + '\"@cs ;' +
        '         l:partOfSpeech ?pos .' +
        '} ';
    let endpoint = "http://127.0.0.1:8080/fuseki/wiki/sparql";
    let params = "?query=" + encodeURIComponent(posQuery) + "&format=json";
    let poses = JSON.parse(getResponseText(endpoint + params));
    let bindings = poses["results"]["bindings"];
    for (i = 0; i < bindings.length; i++) {
        output.insertAdjacentElement("<p>" + bindings[i]["pos"]["value"] + "</p>");
    }
}

function getResponseText(url) {
    let result;
    let http = new XMLHttpRequest();
    http.open("GET", url, false);
    http.onreadystatechange = function () {
        if (http.readyState === 4) {
            result = http.responseText;
        }
    };
    http.send();
    return result;
}

let PREFIXES = "PREFIX b: <http://www.example.com/ontology#> " +
    "PREFIX lemon: <http://lemon-model.net/lemon#> " +
    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX wiki: <http://cs.wiktionary.org/wiki/> " +
    "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
    "PREFIX l: <http://www.lexinfo.net/ontology/2.0/lexinfo#> ";