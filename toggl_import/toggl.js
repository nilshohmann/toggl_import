
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

function getValue(key) {
	if (arguments.length > 1) {
		return Promise.all([].slice.call(arguments).map(arg => getValue(arg)))
	}

	return new Promise(function(resolve, reject) {
		chrome.storage.local.get(key, function(value) {
			if (value && value[key]) {
				resolve(value[key]);
			} else {
				resolve(null);
			}
		});
	});
}

function loadWorkspace(apiToken) {
	let url = "https://www.toggl.com/api/v8/workspaces";

	return requestJsonAsync(url, apiToken).then(jsonData => {
		if (!jsonData || !jsonData.length > 0 || !jsonData[0]["id"]) {
			throw new Error("Failed to load workspaces!");
		}

		return jsonData[0]["id"];
	});
}

function loadEntries(apiToken, workspaceID, date) {
	let url = "https://toggl.com/reports/api/v2/details?"
		+ "workspace_id="+ workspaceID +"&since="+ date +"&until="+ date +"&user_agent=toggl_import"

	return requestJsonAsync(url, apiToken).then(jsonData => {
		if (!jsonData || !jsonData["data"]) {
			throw new Error("Failed to load time entries!");
		}

		let entries = jsonData["data"].map(function(entry) {
			return {
				'project': entry["project"],
				'color': entry["project_hex_color"].toUpperCase(),
				'client': entry["client"],
				'description': entry["description"],
				'start': new Date(entry["start"]),
				'end': new Date(entry["end"])
			}
		});

		return entries;
	});
}