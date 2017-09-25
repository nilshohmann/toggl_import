
$(function() {
	const extensionId = JSON.stringify(chrome.runtime.id);
	const version = chrome.runtime.getManifest().version;
	console.debug("Extension " + extensionId +" (" + version + "): project_details loaded!!!");

	TogglImport.setValue("auto_import", false);

	function selectProjectsToImport() {
		if (TogglImport.ui.chooserDialogIsShown()) {
			return;
		}

		let currentEntries = [];

		const query = function(beginDate, endDate) {
			console.debug("Fetching entries from " + beginDate + " until " + endDate);

			return TogglImport.loadEntries(beginDate, endDate).then(entries => {
				console.debug("Found "+ entries.length +" time entries.");
				currentEntries = entries;

				return TogglImport.util.getProjects(entries);
			});
		};

		TogglImport.ui.showChooserDialog(query, true)
		.then(TogglImport.util.updateProjectPrefixes)
		.then(projects => {
			const selectedProjects = projects.filter(e => !!e.selected);
			console.log("Selected projects:", selectedProjects);

			const selectedEntries = currentEntries.filter(e => {
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
			if (selectedEntries.length > 0) {
				startAutoImport(selectedEntries);
			}
		}).catch(error => {
			if (error) {
				console.error(error);
			} else {
				console.debug("Selection cancelled");
			}
		});
	}

	/*
	 * Splits a list of time entries by their date
	 */
	function splitEntriesByDates(entries) {
		entries.forEach(e => e["date"] = TogglImport.util.formatDate(e.start));
		return entries.sort(function(a, b) {
			return a.start - b.start;
		}).reduce(function(dict, x) {
	    if (!dict[x["date"]]) { dict[x["date"]] = []; }
	    dict[x["date"]].push(x);
	    return dict;
	  }, {});
	}

	/*
	 * Start the automatic import
	 */
	function startAutoImport(entries) {
		console.log("Starting auto import...");

		entries = splitEntriesByDates(entries);
		entries["dates"] = Object.keys(entries).sort();
		entries["currentIndex"] = 0;

		TogglImport.setValue("auto_import", entries);
		$(".rtbSlide .RadToolBarDropDown ul li a span:contains(Tageszeiterfassung)").click();
	}

	/*
	 * Setup UI for auto import
	 */
	function setupAutoImportButton() {
		const seperator = $('<li class="rtbSeparator"><span class="rtbText"></span></li>');
		const button = TogglImport.ui.buildAutoImportButton();

		button.click(selectProjectsToImport);
		button.hover(function() {
			$(this).addClass("rtbItemHovered");
		}, function() {
			$(this).removeClass("rtbItemHovered");
		});
		$("#DialogToolBar ul.rtbUL").append(seperator).append(button);
	}

	setupAutoImportButton();
});
