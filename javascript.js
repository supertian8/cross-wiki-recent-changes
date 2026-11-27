//Fork of https://meta.wikimedia.org/wiki/User:Dentonius/scripts/GlobalRecentChanges.js
"use strict";

window.GlobalRecentChanges = {};

if ("Notification" in window) {
	Notification.requestPermission((result) => {
	  console.log(result);
	});
}

async function apiSetup () {
	for (let i = 0; i < window.wikis.length; i += 5){
		console.log("Starting initial get for " + window.wikis[i]);
		let params =
			{
				action: "query",
				origin: "*",
				meta: "siteinfo",
				format: "json"
			};
		
		var PARTIAL_URL = "?";
		Object.keys(params).forEach(function(key) {PARTIAL_URL += "&" + key + "=" + params[key];});
		var urlToFetch = window.wikis[i] + window.wikis[i + 1] + PARTIAL_URL;
		try {
			await fetch(urlToFetch)
				.then(function(response) {return response.json();})
				.then(function(response) {
					if (!window.wikis[i + 2]) {
						window.wikis[i + 2] = response.query.general.articlepath.replaceAll("$1", "");
					}
					if (!window.wikis[i + 3]) {
						window.wikis[i + 3] = response.query.general.favicon;
					}
				});
		} catch (errorMessage) {
			console.error("Initial get failed for " + window.wikis[i]);
			console.error(errorMessage);
			document.getElementById("errors").innerHTML += "Initial get failed for " + window.wikis[i] + ". You may have input the URL or article path wrong, the wiki may be offline, or the wiki's DDoS protection prevents its API from being accessed. Refresh to try again.<br/>";
			window.wikis.splice(i, 5);
			console.log(window.wikis);
			apiSetup();
		}
	}
}

function setup () {
	window.errors = {};
	
	if (!document.cookie.includes("cwrcdata=")) {
		document.getElementById("main-lines").innerHTML = 
			"<h3>" +
			"Welcome to Cross-wiki recent changes, " +
			"an app where one can see the recent changes of " +
			"multiple MediaWiki websites in one feed " +
			"and receive notifications for new edits. " +
			"You currently have no wikis loaded. " + 
			"You can add some in the configuration menu linked above." +
			"</h3>";
			return;
	}

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
		window.wikis = decompressedData.split("\n");
		await apiSetup();
		window.GlobalRecentChanges.main();
	});
}

window.GlobalRecentChanges.main = function () {
    let containers = document.getElementById('main-lines');
	let wikis = window.wikis;
	
    let limit = 100; //how many edits will be shown per wiki
    let rcnamespace = ''; //lets all changes be shown in recent changes
    let params =
        {
            action: "query",
			origin: "*",
            list: "recentchanges",
            rcprop: "timestamp|title|ids|sizes|flags|user|parsedcomment|comment|loginfo",
            rclimit: limit,
            rcnamespace: rcnamespace,
            format: "json"
        };


    let globalrc = [[]];
    //globalrc.elementIndex = elementIndex;
    globalrc.params = params;
	globalrc.queueRoot = [];
    globalrc.queueAPIpath = [];
	globalrc.queueArticlePath = [];
	globalrc.queueFavicon = [];
	globalrc.queueNotif = [];
    globalrc.queueIndex = 0;
    globalrc.recentchanges = [];
	
	for (const i in wikis) {
		if (i % 5 === 0){
			globalrc.queueRoot[globalrc.queueRoot.length] = wikis[i];
		} else if (i % 5 === 1) {
			globalrc.queueAPIpath[globalrc.queueAPIpath.length] = wikis[i];
		} else if (i % 5 === 2) {
			globalrc.queueArticlePath[globalrc.queueArticlePath.length] = wikis[i];
		} else if (i % 5 === 3) {
			globalrc.queueFavicon[globalrc.queueFavicon.length] = wikis[i];
		} else if (i % 5 === 4) {
			globalrc.queueNotif[globalrc.queueNotif.length] = wikis[i];
		}
	}
	
    window.GlobalRecentChanges.fetcher(globalrc);
};

window.GlobalRecentChanges.fetcher = async function(globalrc) {
    if (globalrc.queueIndex < globalrc.queueRoot.length) {
        let queueIndex = globalrc.queueIndex;
        //let elementIndex = globalrc.elementIndex;
        let params = globalrc.params;
			
		let PARTIAL_URL = "?";
		Object.keys(params).forEach(function(key) {PARTIAL_URL += "&" + key + "=" + params[key];});
		let url = globalrc.queueRoot[queueIndex] + globalrc.queueAPIpath[queueIndex] + PARTIAL_URL;
		let prePage = globalrc.queueRoot[queueIndex] + globalrc.queueArticlePath[queueIndex];
		let articlePath = globalrc.queueArticlePath[queueIndex];
		let favicon = globalrc.queueFavicon[queueIndex];
		let notif = globalrc.queueNotif[queueIndex];
		
        console.log('#' + (queueIndex + 1) + ' of ' + globalrc.queueRoot.length + ' ; fetching  ' + url);

		try {
			await fetch(url)
				.then(function(response) {return response.json();})
				.then(function(response) {
					let recentchanges = response.query.recentchanges;
					console.log(recentchanges);
					for (let i = 0; i < recentchanges.length; ++i) {
						if (recentchanges[i].parsedcomment !== undefined) {
							recentchanges[i].parsedcomment = recentchanges[i].parsedcomment.replaceAll('href=\"' + articlePath, 'href=\"' + prePage	);
						}
						recentchanges[i].url = prePage + recentchanges[i].title;
						recentchanges[i].urlDiff = prePage + recentchanges[i].title + '?curid=' + recentchanges[i].pageid + '&diff=' + recentchanges[i].revid + '&oldid=' + recentchanges[i].old_revid; 
						recentchanges[i].urlHist = prePage + 'Special:History/' + recentchanges[i].title;
						recentchanges[i].urlUser = prePage + "User:" + recentchanges[i].user;
						recentchanges[i].urlUserContribs = prePage + "Special:Contributions/" + recentchanges[i].user;
						recentchanges[i].urlUserTalk = prePage + "User talk:" + recentchanges[i].user;
						recentchanges[i].urlLog = prePage + "Special:Log/" + recentchanges[i].logtype;
						recentchanges[i].urlRecentChanges = prePage + "Special:RecentChanges";
						recentchanges[i].favicon = favicon;
						recentchanges[i].prePage = prePage;
						recentchanges[i].diffBytes = recentchanges[i].newlen - recentchanges[i].oldlen;
						recentchanges[i].notif = notif;
					}
					globalrc.recentchanges = globalrc.recentchanges.concat(recentchanges);
					globalrc.queueIndex++;
					window.GlobalRecentChanges.fetcher(globalrc);
					return;
				});
		} catch (errorMessage) {
			console.error(errorMessage);
			const oneMinuteFromNow = new Date(Date.now() + 60000)
			
			window.errors[oneMinuteFromNow.toISOString()] = document.createElement("div");
			window.errors[oneMinuteFromNow.toISOString()].innerHTML = currentTime() + " Error loading " + globalrc.queueRoot[queueIndex];
			document.getElementById("errors").prepend(window.errors[oneMinuteFromNow.toISOString()]);
			
			setTimeout(function() { window.GlobalRecentChanges.fetcher(globalrc); }, 1000);
		}
		
        return;
    }

    let recentchanges = globalrc.recentchanges;	
	console.log(recentchanges);
	
    recentchanges.sort((a,b) => (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0));
    recentchanges.reverse();

    let buf = '<table>';
	
	var newEdits = 0;
	var notifText = "";
	var reachedLatest = false;
	var latest = "2076-07-09T06:34:12Z"; //Notifications will break if the date set in this late is after the current date
	if (document.getElementById("firstTimestamp") != null) {
		latest = document.getElementById("firstTimestamp").textContent;
	}
    for (let i = 0; i < recentchanges.length; ++i) {
		[reachedLatest, newEdits, notifText] = notification(recentchanges[i], latest, reachedLatest, newEdits, notifText);
		buf += drawEdit(recentchanges[i], i);
    }
    buf += '</table>';

	document.getElementById('main-lines').innerHTML = buf;
	
	for (const i in window.errors) {
		if (new Date(i) < new Date()) {
			window.errors[i].remove();	
			delete window.errors[i];
		}
	}
	
	setTimeout(function() { window.GlobalRecentChanges.main(); }, 6000);
};

function drawEdit (edit, i) {
	let buf = '';
	const rowBackgroundColors = ['#fff', '#ddd']
    let currentRowBackgroundColor = rowBackgroundColors[i % 2];
	//if (i === 0) buf += "<h1>" + edit.revid + "</h1>";
	buf += '<tr style="background-color: ' + currentRowBackgroundColor + ';">';
		if (i === 0) {
			buf +='<td><span id="firstTimestamp">' + edit.timestamp  + '</span> &middot; '
		} else {
			buf += '<td>' + edit.timestamp  + ' &middot; '
		}
			
		if (edit.new === "") {
			buf += "<b><abbr title='This edit created a new page'>N</abbr></b>";
		} else {
			buf += "<span style='color: rgba(0, 0, 0, 0.3)'>N</span>";
		}
		if (edit.minor === "") {
			buf += "<b><abbr title='This is a minor edit'>m</abbr></b>";
		} else {
			buf += "<span style='color: rgba(0, 0, 0, 0.3)'>m</span>";
		}

		if (edit.bot === "") {
			buf += "<b><abbr title='This edit was preformed by a bot'>b</abbr></b> &middot; ";
		} else {
			buf += "<span style='color: rgba(0, 0, 0, 0.3)'>b</span> &middot; ";
		}
		
		buf +='<a href="' + edit.urlRecentChanges + '"><img src="' + edit.favicon + '" width="16" height="16"/></a> &middot; ';
		
		if (edit.type === "log") {
			buf += writeLog(
				edit.logtype,
				edit.logaction,
				edit.logid,
				edit.user,
				edit.title,
				edit.logparams,
				edit.url, 
				edit.urlDiff,
				edit.urlHist,
				edit.urlUser,
				edit.urlUserTalk,
				edit.urlUserContribs,
				edit.urlLog,
				edit.prePage,
				edit.parsedcomment
			)
			return buf;		
		}
		
		buf +='<a href="' + edit.url +  '">'+ edit.title + '</a> (' +
            '<a href="' + edit.urlDiff + '">diff</a> | ' +
			'<a href="' + edit.urlHist + '">hist</a>) &middot; ';
	
		if (edit.diffBytes === 0)	 {
			buf += "<span style='color:grey;'>(0)</span>";
		} else if (edit.diffBytes <= -500) {
			buf += "<b style='color:red;'>(" + edit.diffBytes + ")</b>";
		} else if (edit.diffBytes >= 500) {
			buf += "<b style='color:green;'>(+" + edit.diffBytes + ")</b>";
		} else if (edit.diffBytes > 0) {
			buf += "<span style='color:green;'>(+" + edit.diffBytes + ")</span>";
		} else if (edit.diffBytes < 0) {
			buf += "<span style='color:red;'>(" + edit.diffBytes + ")</span>";
		}
		
			
        buf  += ' &middot; <a href="' + edit.urlUser + '">' + edit.user + '</a> ' +
				' (<a href="' + edit.urlUserTalk + '">talk</a>' +
				' | <a href="' + edit.urlUserContribs + '">contribs</a>)';
		if (edit.parsedcomment !== "") {
			buf += ' <i>(' + edit.parsedcomment + ")</i>";
		}
		return buf;
}

function notification (recentchanges, latest, reachedLatest, newEdits, notifText, notif) {
	//console.log(recentchanges);
	if (reachedLatest) {
		return [false, 0, ""];
	}
	if (recentchanges.timestamp > latest && recentchanges.notif) {
		newEdits += 1;
		notifText += "(" + recentchanges.type + ") " + recentchanges.user + " edited " + recentchanges.title;
		if (recentchanges.comment) notifText += " (" + recentchanges.comment + ")";
		notifText += "\n";
		return [reachedLatest, newEdits, notifText];
	}
	
	if (recentchanges.timestamp > latest && !recentchanges.notif) {
		return [reachedLatest, newEdits, notifText];
	}

	if (newEdits < 1) return [true, 0, ""];
	const notification =
		(function () {
			console.log('notify for ' + newEdits);
			if (newEdits > 1) return new Notification(newEdits + " NEW EDITS!!", { body: notifText, requireInteraction: true, icon: 'many.jpg'});
			else return new Notification("One new edit", { body: notifText, requireInteraction: true});
		})();
		
	//notification.onclick = function(event) {
	//	event.preventDefault(); // prevent the browser from focusing the Notification's tab
	//	window.open(recentchanges.urlDiff, '_blank');
	//}
	
	return [true, newEdits, notifText];
}

function currentTime () { //Returns current date and time as ISO string
	const now = new Date();
	return now.toISOString();
}

function writeLog(logtype, logaction, logid, user, title, logparams, urlPage, urlDiff, urlHist, urlUser, urlUserTalk, urlUserContribs, urlLog, prePage, editsummary) {
	var buf = ""; 	
	if (logtype === "contentmodel") {
		buf  += ' (<a href="' + prePage + 'Special:Log/contentmodel">Content model change log</a>) &middot; ' +
				' <a href="' + urlUser + '">' + user + '</a> ' +
				' (<a href="' + urlUserTalk + '">talk</a>' +
				' | <a href="' + urlUserContribs + '">contribs</a>)' +	
				' changed the content model of the page' + 
				' <a href="' + urlPage +  '">'+ title + '</a>' +
				' from "' + logparams.oldmodel + '" to "' + logparams.newmodel + '"';
	} else if (logtype === "delete") {
		buf  += ' (<a href="' + prePage + 'Special:Log/delete">Deletion log</a>) &middot; ' + 
				' <a href="' + urlUser + '">' + user + '</a> ' +
				' (<a href="' + urlUserTalk + '">talk</a>' +
				' | <a href="' + urlUserContribs + '">contribs</a>)' +
				' deleted page' +
				' <a href="' + urlPage +  '">'+ title + '</a>';
	} else if (logtype === "import") {
		buf  += ' (<a href="' + prePage + 'Special:Log/import">Import log</a>) &middot; ' + 
				' <a href="' + urlUser + '">' + user + '</a> ' +
				' (<a href="' + urlUserTalk + '">talk</a>' +
				' | <a href="' + urlUserContribs + '">contribs</a>)' +
				' imported' +
				' <a href="' + urlPage +  '">' + title + '</a>' +
				' by file upload' +
				' (' + logparams.count + ' revisions)'
	} else if (logtype === "managewiki") {
		buf  += ' (<a href="' + prePage + 'Special:Log/managewiki">ManageWiki log</a>) &middot; ' +
				' <a href="' + urlUser + '">' + user + '</a> ' +
				' (<a href="' + urlUserTalk + '">talk</a>' +
				' | <a href="' + urlUserContribs + '">contribs</a>)' +
				' changed the settings' +
				' "' +  logparams.changes + '" for "' + logparams.wiki + '"';
	} else if (logtype === 'move') {
		buf  += ' (<a href="' + prePage + 'Special:Log/move">Move log</a>) &middot; ' + 
				' <a href="' + urlUser + '">' + user + '</a> ' +
				' (<a href="' + urlUserTalk + '">talk</a>' +
				' | <a href="' + urlUserContribs + '">contribs</a>)' +
				' moved page' +
				' <a href="' + urlPage +  '">' + title + '</a>' +
				' to' +
				' <a href="' +  prePage + logparams.target_title + '">' + logparams.target_title + "</a>";
	} else if (logtype === "protect") {
		buf  += ' (<a href="' + prePage + 'Special:Log/protect">Protection log</a>) &middot; ' +
				' <a href="' + urlUser + '">' + user + '</a> ' +
				' (<a href="' + urlUserTalk + '">talk</a>' +
				' | <a href="' + urlUserContribs + '">contribs</a>)';
		if (logaction === "protect") buf += ' protected'; else if (logaction === "unprotect") buf += ' unprotected';
		buf  += ' <a href="' + urlPage +  '">'+ title + '</a> ' +
				logparams.description;
	} else if (logtype === "managetags") {
		buf  += 
			' (<a href="' + prePage + 'Special:Log/managetags">Tag management log</a>) &middot; ' +
			' <a href="' + urlUser + '">' + user + '</a> ' +
			' (<a href="' + urlUserTalk + '">talk</a>' +
			' | <a href="' + urlUserContribs + '">contribs</a>)' +
			(function(){
				if (logaction === "create") return ' created the tag "' + logparams.tag + '"';
				if (logaction === "deactivate") return ' deactivated the tag "' + logparams.tag + '" for use by users and bots';
				if (logaction === "activate") return ' activated the tag "' + logparams.tag + '" for use by users and bots';
				if (logaction === "delete") return ' deleted the tag "' + logparams.tag + '" (removed from ' + logparams.count + ' 	revision or log entry)';
			})();
		
		
	} else if (logtype === "upload") {
		buf  += ' (<a href="' + prePage + 'Special:Log/upload">Upload log</a>) &middot; ' +
				' <a href="' + urlUser + '">' + user + '</a> ' +
				' (<a href="' + urlUserTalk + '">talk</a>' +
				' | <a href="' + urlUserContribs + '">contribs</a>)'		
		if (logaction === 'upload') {
			buf += ' uploaded';
		} else if (logaction === 'revert') {
			buf += ' reverted';
		} else {
			buf += ' uploaded a new version of';
		}
		buf  += ' <a href="' + urlPage +  '">'+ title + '</a>';
		if (logaction === 'revert') buf += ' to an old version';
		
	} else if (logtype === "newusers") {
		buf  += ' (<a href="' + prePage + 'Special:Log/newusers">User creation log</a>) &middot; ' +
				' User account' + 
				' <a href="' + urlPage + '">' + title.substring(5) + '</a> ' +
				' (<a href="' + prePage + "User talk:" + title.substring(5) + '">talk</a>' +
				' | <a href="' + prePage + "Special:Contributions/" + title.substring(5) + '">contribs</a>)' +
				' was created';
		if (logaction === "create2") {
			buf  += ' by <a href="' + urlUser + '">' + user + '</a> ' +
					' (<a href="' + urlUserTalk + '">talk</a>' +
					' | <a href="' + urlUserContribs + '">contribs</a>)';
		}
	} else if (logtype === "renameuser") {
		buf  += ' (<a href="' + prePage + 'Special:Log/renameuser">User rename log</a>) &middot; ' + 
				' <a href="' + urlUser + '">' + user + '</a> ' +
				' (<a href="' + urlUserTalk + '">talk</a>' +
				' | <a href="' + urlUserContribs + '">contribs</a>)' +
				' renamed user' +
				' <a href="' + urlPage + '">'+ logparams.olduser + '</a>' +
			' (' + logparams.edits + ' edits) to ' +
				' <a href="' + prePage + 'User:' + logparams.newuser + '">'+ logparams.newuser + '</a>';
	
	} else if (logtype === "rights") {
		let oldGroups = {};
		let newGroups = {};
		let removedGroups = {};
		let unchangedGroups = {};
		let addedGroups = {};
		let changedExpiryGroups = {}
		
		
		for (const i of logparams.oldmetadata) {
			oldGroups[i.group] = i.expiry;
		}
		for (const i of logparams.newmetadata) {
			newGroups[i.group] = i.expiry;
		}
		
		for (const i in newGroups) {
			if (!oldGroups[i]) {
				addedGroups[i] = newGroups[i];
			} else if (newGroups[i] !== oldGroups[i]){
				changedExpiryGroups[i] = {oldDate: oldGroups[i], newDate: newGroups[i]}
			} else {
				unchangedGroups[i] = newGroups[i];
			}
		}
		for (const i in oldGroups) {
			if (!newGroups[i]) {
				removedGroups[i] = oldGroups[i];
			}
		}
		
		buf  += 
			' (<a href="' + prePage + 'Special:Log/rights">User rights log</a>) &middot; ' + 
			' <a href="' + urlUser + '">' + user + '</a> ' +
			' (<a href="' + urlUserTalk + '">talk</a>' +
			' | <a href="' + urlUserContribs + '">contribs</a>)' +
			
			' changed group membership for' + 
			' <a href="' + urlPage +  '">'+ title.substring(5) + '</a>:';
		
		if (Object.keys(addedGroups).length > 0) {
			buf += ' granted '
			for (const i in addedGroups) {
				buf += i;
				if (addedGroups[i] !== "infinity") {
					buf += " (temporary, until " + addedGroups[i] + ")";
				}
				buf += ", ";
			}
			
			buf = buf.slice(0, -2); //removes last comma
			buf += "; ";
			
		}
		if (Object.keys(removedGroups).length > 0) {
			buf += ' revoked '
			for (const i in removedGroups) {
				buf += i;
				if (removedGroups[i] !== "infinity") {
					buf += " (was temporary, until " + removedGroups[i] + ")";
				}
				buf += ", ";
			}
			
			buf = buf.slice(0, -2); //removes last comma
			buf += "; ";
			
		}
		if (Object.keys(changedExpiryGroups).length > 0) {
			buf += ' changed expiration of '
			for (const i in changedExpiryGroups) {
				buf += i;
				buf += " (until " + changedExpiryGroups[i].oldDate + ";"
				buf += " was " + changedExpiryGroups[i].newDate + ")"
				buf += ", ";
			}
			
			buf = buf.slice(0, -2); //removes last comma
			buf += "; ";
			
		}
		if (Object.keys(unchangedGroups).length > 0) {
			buf += ' kept '
			for (const i in unchangedGroups) {
				buf += i;
				if (unchangedGroups[i] !== "infinity") {
					buf += " (temporary, until " + unchangedGroups[i] + ")";
				}
				buf += ", ";
			}
			
			buf = buf.slice(0, -2); //removes last comma
			buf += " unchanged";
			
		}
		
		
		if (buf.slice(-2) === "; ") {
			buf = buf.slice(0, -2);
		}
		
		
	} else if (logtype === "datadump") {
		buf  += ' (<a href="' + prePage + 'Special:Log/datadump">Wiki backup log</a>) &middot; ' + 
				' <a href="' + urlUser + '">' + user + '</a> ' +
				' (<a href="' + urlUserTalk + '">talk</a>' +
				' | <a href="' + urlUserContribs + '">contribs</a>)' +
				(function(){
					if (logaction === "delete") return " deleted backup";
					if (logaction === "generate") return " queued the generation of a backup titled";
					if (logaction === "generate-in-progress") return " has initiated for a backup titled";
					if (logaction === "generate-completed") return " has completed for a backup titled";
				})() +
				" '" + logparams.filename + "'";
				
	} else {
		buf  += 
			'(<a href="' + urlLog + '">' + logtype + ' action</a>) &middot; ' +
			'<a href="' + urlUser + '">' + user + '</a> ' +
			' (<a href="' + urlUserTalk + '">talk</a>' +
			' | <a href="' + urlUserContribs + '">contribs</a>)' +
			' performed an action undefined in CWRC:' +
			
			' target: ' +
			'<a href="' + urlPage +  '">'+ title + '</a> (' +
			'<a href="' + urlDiff + '">diff</a> | ' +
			'<a href="' + urlHist + '">hist</a>)' +
				
			', logtype: ' + logtype +
			', logaction: ' + logaction +
			', logparams: ' + JSON.stringify(logparams);
	}
	
	if (editsummary !== "") {
		buf += ' <i>(' + editsummary + ")</i>";
	}
	return buf;
}

//$(window.GlobalRecentChanges.main);
window.onload  = async function(){
	setup();
};
