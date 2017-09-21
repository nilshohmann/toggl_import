
$(function() {
	const extensionId = JSON.stringify(chrome.runtime.id);
	const version = chrome.runtime.getManifest().version;
	console.debug("Extension " + extensionId +" (" + version + "): project_import loaded!!!");

	function getStoredProjects() {
		return TogglImport.getValue("projects").then(projects => {
			if (!projects || !projects.length) {
				projects = [];
			} else {
				projects = JSON.parse(projects);
				projects.forEach(p => {
					p.fullLabel = p.label + " (" + p.id + ", " + p.begin + "-" + p.end + ")";
				});
			}
			return projects;
		});
	}

	getStoredProjects().then(projects => console.log("Stored projects: ", projects));

	/*
	 * Listen on content changes
	 */
	$("#Meta_ContentPanel").on("DOMNodeInserted", function(e) {
		const header = $.trim($(e.target).find(".page-header").text());
		if (header != "Aufträge") {
			return;
		}

		const projects = $("#JobContainer_DataGrid_ctl00 tbody tr").map((i, e) => {
			const cells = $(e).children("td");
			return {
				id: $.trim($(cells[2]).text()),
				label: $.trim($(cells[3]).text()),
				begin: $.trim($(cells[5]).text()),
				end: $.trim($(cells[6]).text())
			};
		}).splice(0);

		console.log("Found projects: ", projects);
		TogglImport.setValue("projects", JSON.stringify(projects));
	});
});
