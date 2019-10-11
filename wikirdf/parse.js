function sendRequest() {
    let word = document.getElementById("word").value;
    generateResults(word);
}

function generateResults(word) {
    let output = document.getElementById("output");
    output.innerText = "";
    let trimmedWord = word.trim();
    if (trimmedWord !== "") {
        output.innerText += trimmedWord + "\n";
        parseWord(trimmedWord);
    }
}

function parseWord(word) {
    getAnswer(word);
}

function getAnswer(word) {
    // let client = new XMLHttpRequest();
    // client.open("GET", "http://localhost:3330/fuseki", true);
    // client.onreadystatechange = function () {
    //     if (client.readyState === 4) {
    //         var obj = JSON.parse(client.responseText);
    //         if (typeof obj.places !== "undefined") {
    //
    //         }
    //     }
    // };
    // client.send();
}

