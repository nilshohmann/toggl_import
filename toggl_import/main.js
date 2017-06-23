
$(document).ready(function() {
	const extensionId = JSON.stringify(chrome.runtime.id);
	console.debug("Extension "+ extensionId +" loaded!!!");

	/*
		HTML for project chooser dialog
	*/
	const dialogHTML = `<div id="ProjectChooser" class="RadWindow_Metro" unselectable="on" style="position: absolute; width: 260px; left: 50%; top: 50%; z-index: 3024; margin-left: -130px; margin-top: -80px; padding: 1px;">
	<style>
		.project-prefix {
			display: none;
		}
		.project-prefix + label {
			position: relative;
			width: 20px;
			height: 16px;
			margin: 8px;
			float: right;
			cursor: pointer;
		}
		.project-prefix + label:hover {
			background: #fee;
		}
		.project-prefix + label:before {
			position: absolute;
			left: 0;
			top: -2px;
			content: '[';
		}
		.project-prefix + label:after {
			position: absolute;
			right: 0;
			top: -2px;
			content: ']';
		}
		.project-prefix:checked + label span:after {
			content: '\\2714';
			position: absolute;
			top: 0px;
			left: 5px;
			font-size: 12px;
		}
	</style>
	<table cellspacing="0" cellpadding="0" style="height: 100%; width: 100%;">
	<tr>
		<td class="rwTopLeft" style="width: 4px;"></td>
		<td class="rwTitlebar" style="padding-left: 4px; height: 31px; color: white;">
			Choose projects:
			<ul class="" style="width: 32px; float: right; list-style: none; margin: 0px; padding: 0px;"><li>
				<a title="Close" href="" style="width: 29px; height: 18px; display: block; background-image: url(/Img/theme/Skin/Window/CommandButtonSprites.gif); background-position: -90px -1px;"></a>
			</li></ul>
		</td>
		<td class="rwTopRight" style="width: 4px"></td>
	</tr>
	<tr>
		<td class="rwBodyLeft"></td>
		<td style="background-color: white;">

			<form></form>

			<hr style="margin: 0px; background: black;">
			<span class="RadButton RadButton_Metro rbSkinnedButton rbHovered" style="width:80px; padding: 0; background-color: #f9f9f9; border: 1px solid #cdcdcd; margin: 8px -40px; left: 50%;" tabindex="0">
				<input type="button" class="rbDecorated" value="Continue" style="margin-left: 4px;" />
			</span>
		</td>
		<td class="rwBodyRight"></td></tr>
	<tr>
		<td class="rwFooterLeft"></td>
		<td class="rwFooterCenter"></td>
		<td class="rwFooterRight"></td>
	</tr>
	</table>
</div>`;

	/*
		Sleep function
	*/
	function sleep(time) {
		return new Promise(resolve => setTimeout(resolve, time));
	}

	/*
		Show messages for 5 seconds
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
		Format date object in HH:mm format
	*/
	function formatDate(date) {
		const granularity = 5 * 60 * 1000;
		date = new Date((date.getTime() / granularity | 0) * granularity);
		return ("0" + date.getHours()).substr(-2) +":"+ ("0" + date.getMinutes()).substr(-2);
	}

	/*
		Find all time entry rows
	*/
	function getRows() {
		const table = $('#ctl00_Content_TimeRecordGrid_ctl00 > tbody');
		if (table.length == 0) {
			table = $('.rgRow').first().parent();
		}

		return table.children("tr:not(.rgNoRecords)");
	}

	/*
		Show the project chooser dialog
	*/
	function showChooserDialog(items) {
		function createEntry([name, color, projectPrefix]) {
			const id = name.replace(" ", "_");
			return '<input type="checkbox" id="'+ id +'" name="'+ name +'" value="" style="margin: 8px; width: 20px; height: 16px;">' + 
				'<label for="'+ id +'" style="font-size: 14px; line-height: 20px;">' +
					'<div style="position: relative; top: 2px; width: 14px; height: 14px; background: '+ color +'; display: inline-flex; margin-right: 6px; border-radius: 7px;"></div>' +
					name +
				'</label>' +
				'<input type="checkbox" class="project-prefix" id="'+ id +'_prefix" name="'+ name +'_prefix" value=""'+ (projectPrefix ? ' checked>' : '>') +
				'<label for="'+ id +'_prefix"><span></span></label>';
		}

		return new Promise(function(resolve, reject) {
			console.debug("Create project chooser dialog");

			chooserDialog = $(dialogHTML);

			chooserDialog.find("a").click(function(event) {
				event.preventDefault();
				chooserDialog.remove();
				reject();
			});

			chooserDialog.find("input[type=button]").click(function() {
				const formData = chooserDialog.find("form").serialize();
				let selectedValues = [];
				if (formData.length > 0) {
					selectedValues = formData.replace(new RegExp("=", 'g'), "").split("&").map(decodeURIComponent);
				}

				console.debug("Selected values:", selectedValues);

				chooserDialog.remove();
				resolve(selectedValues);
			});

			const formItems = items.map(createEntry).join('<hr style="margin: 0px; background: black;">');
			chooserDialog.find("form").html(formItems);

			$("body").append(chooserDialog);
		});
	}

	/*
		Select projects from time entries
	*/
	function selectProjects(entries) {
		const projects = entries.map(e => e["fullProjectName"]);
		const items = entries.map(function(e) {
			return [e["fullProjectName"], e["color"], e["projectPrefix"]];
		}).filter(function(e, i) {
			return projects.indexOf(e[0]) === i;
		});

		console.debug("Found "+ items.length +" projects.");

		return getValue("auto_import").then(function(autoImport) {
			console.debug("Auto Import: " + autoImport);
			if (autoImport && items.length == 1) {
				return items[0];
			}
			return showChooserDialog(items);
		});
	}

	/*
		Trigger adding a new time entry
	*/
	function addEntry() {
		$('#ctl00_Content_TimeRecordGrid_ctl00 > thead .rgAdd').click();
	}

	/*
		Insert selected project entries
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

		function setValue(field, value) {
			field.val(value);
			field.focus();
			field.blur();
		}

		if (getRows().length <= currentIndex) {
			addEntry();
		}

		return waitForEntry().then(() => {
			const inputs = $(getRows()[currentIndex]).find(".riTextBox");
			if (inputs.length != 4) {
				throw new Error("Unable to find table entry for "+ currentIndex);
			}

			setValue($(inputs[0]), formatDate(entries[currentIndex]["start"]));
			setValue($(inputs[1]), formatDate(entries[currentIndex]["end"]));
			setValue($(inputs[2]), "00:00");
			setValue($(inputs[3]), entries[currentIndex]["description"]);

			if (currentIndex >= entries.length-1) {
				return;
			}

			return insertEntries(entries, currentIndex+1);
		});
	}

	/*
		Import time entries from toggl
	*/
	function importToggl() {
		if ($("#ProjectChooser").length > 0) {
			return;
		}

		const rows = getRows();
		if (rows.length > 0 && rows.find(".riTextBox").hasClass("riRead")) {
			showMessage("Some time entries have already been tracked.");
			return;
		}

		getValue("api_token", "workspace_id").then(([apiToken, workspaceID]) => {
			if (!apiToken) throw new Error("API token not available");
			if (!workspaceID) throw new Error("Workspace ID not available");

			const selectedDate = $('#Content_JobDatum').html().split(".").reverse().join("-");
			console.debug("Loading time entries for " + selectedDate);

			return loadEntries(apiToken, workspaceID, selectedDate);
		}).then(function(entries) {
			if (entries.length == 0) {
				throw new Error("No entries found for this date!");
			}

			entries.forEach(e => {
				e["fullProjectName"] = e["project"] ? (e["project"] +" ("+ e["client"] +")") : "(No project)";
			});

			console.debug("Found "+ entries.length +" time entries.");

			getValue("project_prefixes").then(projectPrefixes => {
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
		Setup UI
	*/
	const button = $('<input class="rbDecorated" type="button" id="toggl_import" value="Import" style="width:100%; padding-right: 0px; padding-left: 20px; background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpldj0iaHR0cDovL3d3dy53My5vcmcvMjAwMS94bWwtZXZlbnRzIiB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiBoZWlnaHQ9IjUxcHgiIHdpZHRoPSI1MHB4Ij4KPHBhdGggZmlsbD0icmdiKCAyNDMsIDEyLCAyMiApIiBkPSJNMjUsMC45OTkwMDAwMDAwMDAwMiBDMTEuMTkyLDAuOTk5MDAwMDAwMDAwMDIgMCwxMi4xOTAwMDAwMDAwMDAxIDAsMjYgQzAsMzkuODA5IDExLjE5Miw1MSAyNSw1MSBDMzguODA4LDUxIDUwLDM5LjgwOSA1MCwyNiBDNTAsMTIuMTkwMDAwMDAwMDAwMSAzOC44MDgsMC45OTkwMDAwMDAwMDAwMiAyNSwwLjk5OTAwMDAwMDAwMDAyIFpNMjMuMjQ1LDEwLjczMiBDMjMuMjQ1LDEwLjczMiAyNi43NTYsMTAuNzMyIDI2Ljc1NiwxMC43MzIgQzI2Ljc1NiwxMC43MzIgMjYuNzU2LDI4LjE0NiAyNi43NTYsMjguMTQ2IEMyNi43NTYsMjguMTQ2IDIzLjI0NSwyOC4xNDYgMjMuMjQ1LDI4LjE0NiBDMjMuMjQ1LDI4LjE0NiAyMy4yNDUsMTAuNzMyIDIzLjI0NSwxMC43MzIgWk0yNSwzOC44MjA5OTk5OTk5OTk5IEMxOC4yNTUsMzguODIwOTk5OTk5OTk5OSAxMi43ODIsMzMuMzQ4IDEyLjc4MiwyNi42MDIwMDAwMDAwMDAxIEMxMi43ODIsMjAuOTcxIDE2LjU5MSwxNi4yMzM5OTk5OTk5OTk5IDIxLjc3MywxNC44MTQwMDAwMDAwMDAxIEMyMS43NzMsMTQuODE0MDAwMDAwMDAwMSAyMS43NzMsMTguMzY1IDIxLjc3MywxOC4zNjUgQzE4LjQ4MiwxOS42NTU5OTk5OTk5OTk5IDE2LjE1NCwyMi44NTYgMTYuMTU0LDI2LjYwMjAwMDAwMDAwMDEgQzE2LjE1NCwzMS40ODcwMDAwMDAwMDAxIDIwLjExNSwzNS40NSAyNSwzNS40NSBDMjkuODg1LDM1LjQ1IDMzLjg0OCwzMS40ODcwMDAwMDAwMDAxIDMzLjg0OCwyNi42MDIwMDAwMDAwMDAxIEMzMy44NDgsMjIuODU2IDMxLjUxOCwxOS42NTU5OTk5OTk5OTk5IDI4LjIzMSwxOC4zNjUgQzI4LjIzMSwxOC4zNjUgMjguMjMxLDE0LjgxNDAwMDAwMDAwMDEgMjguMjMxLDE0LjgxNDAwMDAwMDAwMDEgQzMzLjQwOSwxNi4yMzM5OTk5OTk5OTk5IDM3LjIxOCwyMC45NzEgMzcuMjE4LDI2LjYwMjAwMDAwMDAwMDEgQzM3LjIxOCwzMy4zNDggMzEuNzQ4LDM4LjgyMDk5OTk5OTk5OTkgMjUsMzguODIwOTk5OTk5OTk5OSBaICIvPgo8L3N2Zz4K); background-size: 16px 16px; background-position: 8px 2px; background-repeat: no-repeat;" tabindex="-1">');
	button.click(importToggl);

	const span = $('<span class="RadButton RadButton_Metro rbSkinnedButton rbHovered" style="display:inline-block; width:80px; padding: 0; background-color: #f9f9f9; border: 1px solid #cdcdcd;" tabindex="0"></span>').append(button);
	$('#ctl00 > table > tbody > tr:nth-child(2) > td').prepend(span).prepend(messageSpan);
});
