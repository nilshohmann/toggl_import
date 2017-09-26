
$(function() {
	const extensionId = JSON.stringify(chrome.runtime.id);
	const version = chrome.runtime.getManifest().version;
	console.debug("Extension " + extensionId +" (" + version + "): project_import loaded!!!");

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
	function selectProjects(projects) {
		return TogglImport.getValue("direct_import").then(directImport => {
			console.debug("Direct import: " + directImport);
			if (directImport && projects.length == 1) {
				return projects[0];
			}
			return TogglImport.ui.showChooserDialog(projects)
				.then(TogglImport.util.updateProjectPrefixes);
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
			return Promise.reject(new Error("No entries selected."));
		}

		if (!currentIndex) { currentIndex = 0; }
		console.debug("Inserting item " + currentIndex);

		function waitForEntry() {
			return TogglImport.util.sleep(200).then(() => {
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

			setInputValue($(inputs[0]), TogglImport.util.formatTime(entries[currentIndex]["start"]));
			setInputValue($(inputs[1]), TogglImport.util.formatTime(entries[currentIndex]["end"]));
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
		if (TogglImport.ui.chooserDialogIsShown()) {
			return;
		}

		const rows = getRows();
		if (rows.length > 0 && rows.find(".riTextBox").hasClass("riRead")) {
			showMessage("Some time entries have already been tracked.");
			return;
		}

		const selectedDate = $('#Content_JobDatum').html().split(".").reverse().join("-");
		console.debug("Loading time entries for " + selectedDate);
		TogglImport.loadEntries(selectedDate).then(entries => {
			if (entries.length == 0) {
				throw new Error("No entries found for this date!");
			}

			console.debug("Found "+ entries.length +" time entries.");

			return TogglImport.util.getProjects(entries).then(projects => {
				console.debug("Projects", projects);

				return selectProjects(projects);
			}).then(projects => {
				const selectedProjects = projects.filter(e => !!e.selected);
				console.debug("Selected projects:", selectedProjects);

				const selectedEntries = entries.filter(e => {
					return selectedProjects.find(p => p.name == e["fullProjectName"]);
				}).map(e => {
					if (selectedProjects.find(p => !!p.prefix && p.name == e["fullProjectName"])) {
						e["description"] = '['+ e["project"] +'] '+ e["description"];
					}
					return e;
				}).sort(function(a, b) {
					return a.start - b.start;
				});

				console.debug("Selected time entries:", selectedEntries);
				return insertEntries(selectedEntries);
			}).then(() => console.debug("finished."));
		}).catch(error => {
			if (error) {
				console.error(error);
				showMessage(error.message);
			} else {
				console.debug("Selection cancelled");
			}
		});
	}

	/*
	 * Setup UI for single import
	 */
	function setupImportButton() {
		const button = TogglImport.ui.buildImportButton();
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
		console.debug("ProjectID: ", projectID);
	}

	/*
	 * Execute action depending on auto import flag
	 */
	TogglImport.getValue("auto_import").then(autoImport => {
		const page = location.pathname.substr(location.pathname.lastIndexOf("/")+1);
		console.debug("Auto import: ", autoImport);

		// Initial page
		if (page === "Page1.aspx") {
			if (autoImport) {
				setTimeout(function() { $("#ctl00_NextBtn_input").click(); }, 200);
			}

		// Import date selection
		} else if (page === "Page2.aspx") {
			if (autoImport) {
				var date = autoImport.dates[autoImport.currentIndex].split("-").reverse().join(".");
				setInputValue($("#ctl00_Content_Date_dateInput"), date);
				setTimeout(function() { $("#ctl00_NextBtn_input").click(); }, 200);
			}

		// Time entry record
		} else if (page === "Page3.aspx") {
			setupImportButton();

			if (autoImport) {
				const rows = getRows();
				if (rows.length > 0 && rows.find(".riTextBox").hasClass("riRead")) {
					showMessage("Some time entries have already been tracked.");
					return;
				}

				var date = autoImport.dates[autoImport.currentIndex];
				var entries = autoImport[date];
				console.debug("Entries:", entries);
				setTimeout(function() { insertEntries(entries); }, 200);
			}

		// Cofirm page
		} else if (page === "Page4.aspx") {
			// Nothing to do here

		// Finish page
		} else if (page == "Finish.aspx") {
			// Go to next day
			if (autoImport) {
				// Set flag to trigger import for next date
				TogglImport.getValue("auto_import_status").then(status => {
					if (status == "next") {
						return;
					}

					setTimeout(function() {
						$("#ctl00_CloseBtn_input").click();
						TogglImport.setValue("auto_import_status", "next");
					}, 200);
				});
			}
		}
	});
});
