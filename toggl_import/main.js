
$(function() {
	const extensionId = JSON.stringify(chrome.runtime.id);
	const version = chrome.runtime.getManifest().version;
	console.debug("Extension " + extensionId +" (" + version + "): main loaded!!!");

	/*
	 * Sleep function
	 */
	function sleep(time) {
		return new Promise(resolve => setTimeout(resolve, time));
	}

	/*
	 * Show messages for 5 seconds
	 */
	const messageSpan = $('<span style="color: red; padding-right: 12px;">&nbsp;</span>');
	function showMessage(message) {
		messageSpan.html(message);

		if (message.length > 0) {
			setTimeout(function() {
				messageSpan.html("");
			}, 5000);
		}
	}

	/*
	 * Format date object in HH:mm format
	 */
	function formatTime(date) {
		const granularity = 5 * 60 * 1000;
		date = new Date((date.getTime() / granularity | 0) * granularity);
		return ("0" + date.getHours()).substr(-2) +":"+ ("0" + date.getMinutes()).substr(-2);
	}

	/*
	 * Find all time entry rows
	 */
	function getRows() {
		const table = $('#ctl00_Content_TimeRecordGrid_ctl00 > tbody');
		if (table.length == 0) {
			table = $('.rgRow').first().parent();
		}

		return table.children("tr:not(.rgNoRecords)");
	}

	/*
	 * Select projects from time entries
	 */
	function selectProjects(entries) {
		const projects = entries.map(e => e["fullProjectName"]);
		const items = entries.map(e => {
			return [e["fullProjectName"], e["color"], e["projectPrefix"]];
		}).filter((e, i) => {
			return projects.indexOf(e[0]) === i;
		});

		console.debug("Found "+ items.length +" projects.");

		return TogglImport.getValue("direct_import").then(directImport => {
			console.debug("Direct import: " + directImport);
			if (directImport && items.length == 1) {
				return items[0];
			}
			return ImportUI.showChooserDialog(items);
		});
	}

	/*
	 * Trigger adding a new time entry
	 */
	function addEntry() {
		$('#ctl00_Content_TimeRecordGrid_ctl00 > thead .rgAdd').click();
	}

	/*
	 * Set the content of an input field
	 */
	function setInputValue(field, value) {
		field.val(value);
		field.focus();
		field.blur();
	}

	/*
	 * Insert selected project entries
	 */
	function insertEntries(entries, currentIndex) {
		if (entries == null || entries.length == 0) {
			return new Promise(function(resolve, reject) {
				reject(new Error("No entries selected."));
			});
		}

		if (!currentIndex) { currentIndex = 0; }
		console.log("Inserting item " + currentIndex);

		function waitForEntry() {
			return sleep(200).then(() => {
				if (getRows().length <= currentIndex) {
					return waitForEntry();
				} else {
					return;
				}
			});
		}

		if (getRows().length <= currentIndex) {
			addEntry();
		}

		return waitForEntry().then(() => {
			const inputs = $(getRows()[currentIndex]).find(".riTextBox");
			if (inputs.length != 4) {
				throw new Error("Unable to find table entry for "+ currentIndex);
			}

			setInputValue($(inputs[0]), formatTime(entries[currentIndex]["start"]));
			setInputValue($(inputs[1]), formatTime(entries[currentIndex]["end"]));
			setInputValue($(inputs[2]), "00:00");
			setInputValue($(inputs[3]), entries[currentIndex]["description"]);

			if (currentIndex >= entries.length-1) {
				return;
			}

			return insertEntries(entries, currentIndex+1);
		});
	}

	/*
	 * Import time entries from toggl
	 */
	function importToggl() {
		if (ImportUI.chooserDialogIsShown()) {
			return;
		}

		const rows = getRows();
		if (rows.length > 0 && rows.find(".riTextBox").hasClass("riRead")) {
			showMessage("Some time entries have already been tracked.");
			return;
		}

		const selectedDate = $('#Content_JobDatum').html().split(".").reverse().join("-");
		console.debug("Loading time entries for " + selectedDate);
		TogglImport.loadEntries(selectedDate).then(function(entries) {
			console.debug("Found "+ entries.length +" time entries.");

			TogglImport.getValue("project_prefixes").then(projectPrefixes => {
				console.debug("Project prefixes:", projectPrefixes);
				if (!projectPrefixes) {
					projectPrefixes = {};
				} else {
					entries.forEach(e => {
						e["projectPrefix"] = projectPrefixes[e["fullProjectName"]] == true;
					});
				}

				return selectProjects(entries).then(selectedProjects => {
					entries.forEach(e => {
						const projectPrefix = selectedProjects.indexOf(e["fullProjectName"] + "_prefix") != -1;
						projectPrefixes[e["fullProjectName"]] = projectPrefix;

						e["projectPrefix"] = projectPrefix;
						if (projectPrefix) {
							e["description"] = '['+ e["project"] +'] '+ e["description"];
						}
					});
					chrome.storage.local.set({"project_prefixes": projectPrefixes}, function() {});

					const selectedEntries = entries.filter(e => {
						return selectedProjects.indexOf(e["fullProjectName"]) != -1;
					}).sort(function(a, b) {
						return a.start - b.start;
					});

					console.debug("Selected time entries:", selectedEntries);

					insertEntries(selectedEntries).then(() => {
						console.debug("finished.");
					}).catch(error => {
						console.error(error);
						showMessage(error.message);
					});
				}, function(error) {
					if (error) {
						console.error(error);
					} else {
						console.debug("Selection cancelled");
					}
				});
			});
		}).catch(function(error) {
			showMessage(error.message);
		});
	}

	/*
	 * Setup UI for single import
	 */
	function setupImportButton() {
		const button = $('<input class="rbDecorated" type="button" id="toggl_import" value="Import" style="width:100%; padding-right: 0px; padding-left: 20px; background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpldj0iaHR0cDovL3d3dy53My5vcmcvMjAwMS94bWwtZXZlbnRzIiB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiBoZWlnaHQ9IjUxcHgiIHdpZHRoPSI1MHB4Ij4KPHBhdGggZmlsbD0icmdiKCAyNDMsIDEyLCAyMiApIiBkPSJNMjUsMC45OTkwMDAwMDAwMDAwMiBDMTEuMTkyLDAuOTk5MDAwMDAwMDAwMDIgMCwxMi4xOTAwMDAwMDAwMDAxIDAsMjYgQzAsMzkuODA5IDExLjE5Miw1MSAyNSw1MSBDMzguODA4LDUxIDUwLDM5LjgwOSA1MCwyNiBDNTAsMTIuMTkwMDAwMDAwMDAwMSAzOC44MDgsMC45OTkwMDAwMDAwMDAwMiAyNSwwLjk5OTAwMDAwMDAwMDAyIFpNMjMuMjQ1LDEwLjczMiBDMjMuMjQ1LDEwLjczMiAyNi43NTYsMTAuNzMyIDI2Ljc1NiwxMC43MzIgQzI2Ljc1NiwxMC43MzIgMjYuNzU2LDI4LjE0NiAyNi43NTYsMjguMTQ2IEMyNi43NTYsMjguMTQ2IDIzLjI0NSwyOC4xNDYgMjMuMjQ1LDI4LjE0NiBDMjMuMjQ1LDI4LjE0NiAyMy4yNDUsMTAuNzMyIDIzLjI0NSwxMC43MzIgWk0yNSwzOC44MjA5OTk5OTk5OTk5IEMxOC4yNTUsMzguODIwOTk5OTk5OTk5OSAxMi43ODIsMzMuMzQ4IDEyLjc4MiwyNi42MDIwMDAwMDAwMDAxIEMxMi43ODIsMjAuOTcxIDE2LjU5MSwxNi4yMzM5OTk5OTk5OTk5IDIxLjc3MywxNC44MTQwMDAwMDAwMDAxIEMyMS43NzMsMTQuODE0MDAwMDAwMDAwMSAyMS43NzMsMTguMzY1IDIxLjc3MywxOC4zNjUgQzE4LjQ4MiwxOS42NTU5OTk5OTk5OTk5IDE2LjE1NCwyMi44NTYgMTYuMTU0LDI2LjYwMjAwMDAwMDAwMDEgQzE2LjE1NCwzMS40ODcwMDAwMDAwMDAxIDIwLjExNSwzNS40NSAyNSwzNS40NSBDMjkuODg1LDM1LjQ1IDMzLjg0OCwzMS40ODcwMDAwMDAwMDAxIDMzLjg0OCwyNi42MDIwMDAwMDAwMDAxIEMzMy44NDgsMjIuODU2IDMxLjUxOCwxOS42NTU5OTk5OTk5OTk5IDI4LjIzMSwxOC4zNjUgQzI4LjIzMSwxOC4zNjUgMjguMjMxLDE0LjgxNDAwMDAwMDAwMDEgMjguMjMxLDE0LjgxNDAwMDAwMDAwMDEgQzMzLjQwOSwxNi4yMzM5OTk5OTk5OTk5IDM3LjIxOCwyMC45NzEgMzcuMjE4LDI2LjYwMjAwMDAwMDAwMDEgQzM3LjIxOCwzMy4zNDggMzEuNzQ4LDM4LjgyMDk5OTk5OTk5OTkgMjUsMzguODIwOTk5OTk5OTk5OSBaICIvPgo8L3N2Zz4K); background-size: 16px 16px; background-position: 8px 2px; background-repeat: no-repeat;" tabindex="-1">');
		button.click(importToggl);

		const span = $('<span class="RadButton RadButton_Metro rbSkinnedButton rbHovered" style="display:inline-block; width:80px; padding: 0; background-color: #f9f9f9; border: 1px solid #cdcdcd;" tabindex="0"></span>').append(button);
		$('#ctl00 > table > tbody > tr:nth-child(2) > td').prepend(span).prepend(messageSpan);
	}

	/*
	 * Returns the id of the current project
	 */
	function currentProjectID() {
		const idParam = location.href.substr(location.href.indexOf("?")+1).split("&").filter(e => e.startsWith("ids="));
		if (!idParam.length || idParam[0].length <= 4) {
			throw "Project id not recognized."
		}
		const projectID = idParam[0].substr(4);
		console.log("ProjectID: ", projectID);
	}

	/*
	 * Execute action depending on auto import flag
	 */
	TogglImport.getValue("auto_import").then(autoImport => {
		const page = location.pathname.substr(location.pathname.lastIndexOf("/")+1);
		console.log("Auto import enabled: " + autoImport);

		// Initial page
		if (page === "Page1.aspx") {
			if (autoImport) {
				$("#ctl00_NextBtn_input").click();
			}

		// Import date selection
		} else if (page === "Page2.aspx") {
			if (autoImport) {
				setInputValue($("#ctl00_Content_Date_dateInput"), "14.08.2017");
				$("#ctl00_NextBtn_input").click();
			}

		// Time entry record
		} else if (page === "Page3.aspx") {
			if (autoImport) {

			} else {
				setupImportButton();
			}

		// Cofirm page
		} else if (page === "Page4.aspx") {
			// Nothing to do here

		// Finish page
		} else if (page == "Finish.aspx") {
			// Go to next day
			if (autoImport) {
				// Send event to trigger next import
			}
		}
	});
});
