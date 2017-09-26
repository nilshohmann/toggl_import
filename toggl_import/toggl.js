
var TogglImport = window.TogglImport || {};

(function() {

	/*
	 * Async request
	 */
	function requestJsonAsync(url, apiToken) {
		return new Promise(function(resolve, reject) {
			var request = new XMLHttpRequest();
			request.open("GET", url, true);
			request.setRequestHeader("Authorization", "Basic "+ btoa(apiToken +":api_token"));

			request.addEventListener('load', function(event) {
				if (request.status < 200 || request.status >= 300) {
					reject(new Error("Failed to load request ("+ request.statusText +")!"));
					return
				}

				console.debug(request.responseText);
				var jsonData = JSON.parse(request.responseText);
				resolve(jsonData);
			});

			request.send();
		});
	}

	/*
	 * Read value from local storage
	 */
	TogglImport.getValue = function(key) {
		if (arguments.length > 1) {
			// Return an array with all requested values
			return Promise.all([].slice.call(arguments).map(arg => arguments.callee(arg)));
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
	 * Set value to local storage
	 */
	TogglImport.setValue = function(key, value) {
		return new Promise(resolve => {
			var data = {};
			data[key] = value;
			chrome.storage.local.set(data, resolve);
		});
	}

	/*
	 * Load workspace id(s)
	 */
	TogglImport.loadWorkspace = function(apiToken) {
		const url = "https://www.toggl.com/api/v8/workspaces";

		return requestJsonAsync(url, apiToken).then(jsonData => {
			if (!jsonData || !jsonData.length > 0 || !jsonData[0]["id"]) {
				throw new Error("Failed to load workspaces!");
			}

			return jsonData.map(e => e["id"]).join(",");
		});
	}

	/*
	 * Load entries for a given date
	 */
	TogglImport.loadEntries = function(sinceDate, untilDate) {
		if (!untilDate) untilDate = sinceDate;

		return TogglImport.getValue("api_token", "workspace_id").then(([apiToken, workspaceID]) => {
			if (!apiToken) throw new Error("API token not available");
			if (!workspaceID) throw new Error("Workspace ID not available");

			const url = "https://toggl.com/reports/api/v2/details?workspace_id="+ workspaceID +"&since="+ sinceDate +"&until="+ untilDate +"&user_agent=toggl_import";

			return requestJsonAsync(url, apiToken);
		}).then(jsonData => {
			if (!jsonData || !jsonData["data"]) throw new Error("Failed to load time entries!");

			const entries = jsonData["data"].map(function(entry) {
				return {
					'project': entry["project"],
					'client': entry["client"],
					'fullProjectName': entry["project"] ? (entry["project"] +" ("+ entry["client"] +")") : "(No project)",
					'color': entry["project_hex_color"] ? entry["project_hex_color"].toUpperCase() : "#DDD",
					'description': entry["description"],
					'start': new Date(entry["start"]).getTime(),
					'end': new Date(entry["end"]).getTime()
				};
			});

			return entries;
		});
	}

})();
