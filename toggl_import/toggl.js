
/*
	Async request
*/
requestJsonAsync = function(url, apiToken) {
	return new Promise(function(resolve, reject) {
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.setRequestHeader("Authorization", "Basic "+ btoa(apiToken +":api_token"));

		request.addEventListener('load', function(event) {
			if (request.status < 200 || request.status >= 300) {
				reject(new Error("Failed to load request ("+ request.statusText +")!"));
				return
			}

			console.log(request.responseText);
			var jsonData = JSON.parse(request.responseText);
			resolve(jsonData);
		});

		request.send();
	});
}


/*
	Read value from local storage
*/
function getValue(key) {
	if (arguments.length > 1) {
		// Return an array with all requested values
		return Promise.all([].slice.call(arguments).map(arg => getValue(arg)));
	}

	return new Promise(resolve => {
		chrome.storage.local.get(key, function(value) {
			if (value && value[key]) {
				resolve(value[key]);
			} else {
				resolve(null);
			}
		});
	});
}


/*
	Load workspace id(s)
*/
function loadWorkspace(apiToken) {
	const url = "https://www.toggl.com/api/v8/workspaces";

	return requestJsonAsync(url, apiToken).then(jsonData => {
		if (!jsonData || !jsonData.length > 0 || !jsonData[0]["id"]) {
			throw new Error("Failed to load workspaces!");
		}

		return jsonData.map(e => e["id"]).join(",");
	});
}


/*
	Load entries for a given date
*/
function loadEntries(apiToken, workspaceID, date) {
	const url = "https://toggl.com/reports/api/v2/details?workspace_id="+ workspaceID +"&since="+ date +"&until="+ date +"&user_agent=toggl_import";

	return requestJsonAsync(url, apiToken).then(jsonData => {
		if (!jsonData || !jsonData["data"]) {
			throw new Error("Failed to load time entries!");
		}

		const entries = jsonData["data"].map(function(entry) {
			return {
				'project': entry["project"],
				'color': entry["project_hex_color"] ? entry["project_hex_color"].toUpperCase() : "#DDD",
				'client': entry["client"],
				'description': entry["description"],
				'start': new Date(entry["start"]),
				'end': new Date(entry["end"])
			}
		});

		return entries;
	});
}
