"use strict";

let currentWikiNumber = 0;
let wikiElements = {};

function removeWiki(number) {
	document.getElementById("div" + number).remove();
	delete wikiElements[number];
}

function addBlankWiki () {
	addWiki("", "", "", false);
}

function addWiki(url, api, icon, notif) {
	let createElementFunctions = {
		div: function() {
			const div = document.createElement("div");
			div.setAttribute("id", "div" + currentWikiNumber);
			return div;
		},

		hr: function() {
			const hr = document.createElement("hr");
			return hr;
		},

		urlLabel: function() {
			const urlLabel = document.createElement("label");
			urlLabel.innerHTML = "Wiki URL ";
			urlLabel.setAttribute("for", "url" + currentWikiNumber);
			return urlLabel;
		},
		
		urlInput: function (value) {
			const urlInput = document.createElement("input");
			urlInput.setAttribute("type", "text");
			urlInput.setAttribute("id", "url" + currentWikiNumber);
			urlInput.setAttribute("value", value);
			return urlInput;
		},
		
		urlTooltip: function () {
			const urlTooltip = document.createElement("abbr");
			urlTooltip.setAttribute("title", 
				"Correct examples:️ " +
				" https://en.wikipedia.org ✔️" +
				" https://zh.wiktionary.org ✔️" +
				" https://www.mediawiki.org ✔" +
				" Incorrect examples: " + 
				" en.wikipedia.org ❌" +
				" https://zh.wiktionary.org/ ❌" +
				" https://www.mediawiki.org/wiki ❌");
			urlTooltip.innerHTML = "(!)";
			return urlTooltip;
		},
		
		br: function() {
			const br = document.createElement("br");
			return br;
		},
		
		apiLabel: function() {
			const apiLabel = document.createElement("label");
			apiLabel.innerHTML = "API path ";
			apiLabel.setAttribute("for", "api" + currentWikiNumber);	
			return apiLabel;
		},
		
		apiTooltip: function() {
			const apiTooltip = document.createElement("abbr");
			apiTooltip.setAttribute("title",
				"The location of api.php on this wiki. " +
				"You can find this by going to Special:Version, " +
				"then going to 'Entry point URLs'. " +
				"/w/api.php or /api.php is usually what this value is set to.");
			apiTooltip.innerHTML = "(?)";
			return apiTooltip;
		},
		
		apiInput: function(value) {
			const apiInput = document.createElement("input");
			apiInput.setAttribute("type", "text");
			apiInput.setAttribute("id", "api" + currentWikiNumber);
			apiInput.setAttribute("value", value);
			return apiInput;
		},
		
		iconLabel: function() {
			const iconLabel = document.createElement("label");
			iconLabel.innerHTML = "Icon (leave blank to use favicon) ";
			iconLabel.setAttribute("for", "icon" + currentWikiNumber);
			return iconLabel;
		},
		
		iconInput: function(value) {
			const iconInput = document.createElement("input");
			iconInput.setAttribute("type", "text");
			iconInput.setAttribute("id", "icon" + currentWikiNumber);
			iconInput.setAttribute("value", value);
			return iconInput;
		},
		
		notifLabel: function() {
			const notifLabel = document.createElement("label");
			notifLabel.innerHTML = "Enable notifications ";
			notifLabel.setAttribute("for", "notif" + currentWikiNumber);
			return notifLabel;
		},
		
		notifCheckbox: function(value) {
			const notifCheckbox = document.createElement("input");
			notifCheckbox.setAttribute("type", "checkbox");
			notifCheckbox.setAttribute("id", "notif" + currentWikiNumber);
			if (value) notifCheckbox.setAttribute("checked", true);
			return notifCheckbox;
		},
		
		removeButton: function() {
			const removeButton = document.createElement("input");
			removeButton.setAttribute("type", "button");
			removeButton.setAttribute("id", "remove" + currentWikiNumber);
			removeButton.setAttribute("value", "Remove");
			removeButton.setAttribute("onclick", "removeWiki(" + currentWikiNumber + ");");
			return removeButton;
		},

	}
	
	wikiElements[currentWikiNumber] = {};
	
	const contents = document.getElementById("wikiContents");
	
	const div = createElementFunctions.div ();
	
	wikiElements[currentWikiNumber]['hr'] = createElementFunctions.hr();
	wikiElements[currentWikiNumber]['urlLabel'] = createElementFunctions.urlLabel();
	wikiElements[currentWikiNumber]['urlInput'] = createElementFunctions.urlInput (url);
	//wikiElements[currentWikiNumber]['urlTooltip'] = createElementFunctions.urlTooltip ();
	wikiElements[currentWikiNumber]['br'] = createElementFunctions.br ();
	wikiElements[currentWikiNumber]['apiLabel'] = createElementFunctions.apiLabel ();
	//wikiElements[currentWikiNumber]['apiTooltip'] = createElementFunctions.apiTooltip ();
	wikiElements[currentWikiNumber]['apiInput'] = createElementFunctions.apiInput (api);
	wikiElements[currentWikiNumber]['br2'] = createElementFunctions.br();
	wikiElements[currentWikiNumber]['iconLabel'] = createElementFunctions.iconLabel ();
	wikiElements[currentWikiNumber]['iconInput'] = createElementFunctions.iconInput (icon);
	wikiElements[currentWikiNumber]['br3'] = createElementFunctions.br();
	wikiElements[currentWikiNumber]['notifLabel'] = createElementFunctions.notifLabel ();
	wikiElements[currentWikiNumber]['notifCheckbox'] = createElementFunctions.notifCheckbox (notif);
	wikiElements[currentWikiNumber]['br4'] = createElementFunctions.br();
	wikiElements[currentWikiNumber]['removeButton'] = createElementFunctions.removeButton();
	
	div.appendChild(wikiElements[currentWikiNumber]['urlLabel']);
	//div.appendChild(wikiElements[currentWikiNumber]['urlTooltip']);
	//div.append(" ");
	div.appendChild(wikiElements[currentWikiNumber]['urlInput']);
	div.appendChild(wikiElements[currentWikiNumber]['br']);
	div.appendChild(wikiElements[currentWikiNumber]['apiLabel']);
	//div.appendChild(wikiElements[currentWikiNumber]['apiTooltip']);
	//div.append(" ");
	div.appendChild(wikiElements[currentWikiNumber]['apiInput']);
	div.appendChild(wikiElements[currentWikiNumber]['br2']);
	div.appendChild(wikiElements[currentWikiNumber]['iconLabel']);
	div.appendChild(wikiElements[currentWikiNumber]['iconInput']);
	div.appendChild(wikiElements[currentWikiNumber]['br3']);
	div.appendChild(wikiElements[currentWikiNumber]['notifLabel']);
	div.appendChild(wikiElements[currentWikiNumber]['notifCheckbox']);
	div.appendChild(wikiElements[currentWikiNumber]['br4']);
	div.appendChild(wikiElements[currentWikiNumber]['removeButton']);
	div.appendChild(wikiElements[currentWikiNumber]['hr']);
	contents.appendChild(div);
	
	currentWikiNumber += 1;
}

function getInputs () {
	const CWRC_VERSION = "0.5"
	let inputs = CWRC_VERSION;
	const keys = Object.keys(wikiElements)
	for (const i of keys) {
		//console.log(i);
		const wiki = wikiElements[i];
		for (const j in wiki) {
			//console.log(j);
			if (j.includes("urlInput")) {
				console.log("url: " + wiki[j].value)
				inputs += "\n" + wiki[j].value;
			}
			if (j.includes("apiInput")) {
				console.log("api: " + wiki[j].value)
				inputs += "\n" + wiki[j].value;
				inputs += "\n" //This empty line will be replaced with the article path
			}
			if (j.includes("iconInput")) {
				console.log("icon: " + wiki[j].value)
				inputs += "\n" + wiki[j].value;
			}
			if (j.includes("notifCheckbox")) {
				console.log("notif: " + wiki[j].checked)
				if (wiki[j].checked) {
					inputs += "\n" + "true";
				} else {
					inputs += "\n" + "";
				}
				
			}
		}
	}
	return inputs;
}
	
function saveCookieForYear(name, value) {
	const oneYearFromNow = new Date();
	oneYearFromNow.setUTCFullYear(oneYearFromNow.getUTCFullYear() + 1);
	document.cookie = name + "=" + value + "; expires=" + oneYearFromNow.toUTCString();
}	
	
function saveWikis() {
	let uncompressedData = getInputs ();
	let compressPromise = compressData(uncompressedData);
	let compressedData = compressPromise.then((compressedData) => {
		saveCookieForYear("cwrcdata", compressedData);
	});
}

function readCookie () {
	var cwrcCookie = document.cookie.substring(
        document.cookie.indexOf("cwrcdata=") + 9, 
        (function(){
			const semicolonIndex = document.cookie.indexOf(";", document.cookie.indexOf("cwrcdata="));
			if (semicolonIndex === -1) {
				return;
			} else {
				return semicolonIndex;
			}
		})()
    );
	var cwrcCookieDecompress = decompressData (cwrcCookie);
	cwrcCookieDecompress.then(async (decompressedData) => {
		var dataArray = decompressedData.split("\n");
		
		for (let i = 0; i < dataArray.length; i += 5) {
			console.log(dataArray);
			addWiki(dataArray[i], dataArray[i + 1], dataArray[i + 3], dataArray[i + 4]);
		}
	});
}

var saveData = (function () {
	//Modified from https://stackoverflow.com/a/19328891 
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        let blob = new Blob([data], {type: "text/plain"}),
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

function downloadWikis () {
	let uncompressedData = getInputs ();
	let compressPromise = compressData(uncompressedData);
	let compressedData = compressPromise.then((compressedData) => {
		saveData(compressedData, "config.cwrc");
	});
}

window.onload  = function(){
	readCookie ();
	
	// From https://youtu.be/u2VTtAXq1iA
	const fileInput = document.getElementById('import1');
	fileInput.addEventListener('change', () => {
		const fileRead = new FileReader();
		fileRead.readAsText(fileInput.files[0]);
		fileRead.addEventListener("load", () => {
			saveCookieForYear("cwrcdata", fileRead.result);
			window.location.reload();
		});
	});
	
	const fileInput2 = document.getElementById('import2');
	fileInput2.addEventListener('change', () => {
		const fileRead = new FileReader();
		fileRead.readAsText(fileInput2.files[0]);
		fileRead.addEventListener("load", () => {
			saveCookieForYear("cwrcdata", fileRead.result);
			window.location.reload();
		});
	});
};