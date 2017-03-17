
$(document).ready(function() {
	let extensionId = JSON.stringify(chrome.runtime.id)
	console.log("Extension "+ extensionId +" loaded!!!");

	let messageSpan = $('<span style="color: red; padding-right: 12px;">&nbsp;</span>');
	function showMessage(message) {
		messageSpan.html(message);

		if (message.length > 0) {
			setTimeout(function() {
				messageSpan.html("");
			}, 5000);
		}
	}

	function formatDate(date) {
		let granularity = 5 * 60 * 1000;
		date = new Date((date.getTime() / granularity | 0) * granularity);
		return ("0" + date.getHours()).substr(-2) +":"+ ("0" + date.getMinutes()).substr(-2)
	}

	function getRows() {
		let table = $('#ctl00_Content_TimeRecordGrid_ctl00 > tbody');
		if (table.length == 0) {
			table = $('.rgRow').first().parent();
		}

		if (table.length == 0) {
			return null;
		}

		return table.children("tr:not(.rgNoRecords)");
	}

	function showChooserDialog(items) {
		function createEntry([name, color]) {
			return '<input type="checkbox" id="'+ name +'" name="'+ name +'" value="" style="margin: 8px; width: 20px; height: 16px;"><label for="'+ name +'" style="font-size: 14px; line-height: 20px;"><div style="position: relative; top: 2px; width: 14px; height: 14px; background: '+ color +'; display: inline-flex; margin-right: 6px; border-radius: 7px;"></div>'+ name +'</label>';
		}

		return new Promise(function(resolve, reject) {
			console.log("Create project chooser dialog");

			chooserDialog = $(`
<div id="ProjectChooser" class="RadWindow_Metro" unselectable="on" style="position: absolute; width: 260px; left: 50%; top: 50%; z-index: 3024; margin-left: -130px; margin-top: -80px; padding: 1px;">
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
</div>`);

			chooserDialog.find("a").click(function(event) {
				event.preventDefault();
				chooserDialog.remove();
				reject();
			});

			chooserDialog.find("input[type=button]").click(function() {
				let formData = chooserDialog.find("form").serialize();
				let selectedValues = [];
				if (formData.length > 0) {
					selectedValues = formData.replace(new RegExp("=", 'g'), "").split("&").map(decodeURIComponent);
				}

				chooserDialog.remove();
				resolve(selectedValues);
			});

			let formItems = items.map(createEntry).join('<hr style="margin: 0px; background: black;">');
			chooserDialog.find("form").html(formItems);

			$("body").append(chooserDialog);
		});
	}

	function selectProjects(entries) {
		let items = entries.map(function(e) {
			return [e["fullProjectName"], e["color"]];
		});

		let projects = items.map(e => e[0]);
		items = items.filter(function(e, i, list) {
			return projects.indexOf(e[0]) === i;
		});

		console.log("Found "+ items.length +" projects.");

		return showChooserDialog(items);
	}

	function addEntry() {
		$('#ctl00_Content_TimeRecordGrid_ctl00 > thead .rgAdd').click();
	}

	function sleep(time) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}

	function insertEntries(entries, currentIndex) {
		console.log(entries);
		console.log(currentIndex);
		if (!currentIndex) { currentIndex = 0; }

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
			let inputs = $(getRows()[currentIndex]).find(".riTextBox");
			if (inputs.length != 4) {
				throw new Error("Unable to find table entry for "+ currentIndex);
			}

			setValue($(inputs[0]), formatDate(entries[currentIndex]["start"]));
			setValue($(inputs[1]), formatDate(entries[currentIndex]["end"]));
			setValue($(inputs[2]), "00:00");
			setValue($(inputs[3]), entries[currentIndex]["description"]);
			//inputs[1].value = formatDate(entries[currentIndex]["end"]);
			//inputs[2].value = "00:00";
			//inputs[3].value = entries[currentIndex]["description"];

			if (currentIndex >= entries.length-1) {
				return;
			}

			return insertEntries(entries, currentIndex+1);
		});
	}

	function importToggl() {
		if ($("#ProjectChooser").length > 0) {
			return
		}

		let rows = getRows();
		if (rows.length > 0 && rows.find(".riTextBox").hasClass("riRead")) {
			showMessage("Some time entries have already been tracked.");
			return
		}

		getValue("api_token", "workspace_id").then(([apiToken, workspaceID]) => {
			if (!apiToken) throw new Error("API token not available");
			if (!workspaceID) throw new Error("Workspace ID not available");

			let selectedDate = $('#Content_JobDatum').html().split(".").reverse().join("-");
			console.log("Loading time entries for " + selectedDate);

			return loadEntries(apiToken, workspaceID, selectedDate);
		}).then(function(entries) {
			if (entries.length == 0) {
				throw new Error("No entries found for this date!");
				return
			}

			entries.forEach(e => {
				e["fullProjectName"] = e["project"] +" ("+ e["client"] +")";
			});

			console.log("Found "+ entries.length +" time entries.");

			selectProjects(entries).then(selectedProjects => {
				let selectedEntries = entries.filter(e => {
					return selectedProjects.indexOf(e["fullProjectName"]) != -1;
				}).sort(function(a, b) {
					return a.start - b.start;
				});

				insertEntries(selectedEntries).then(() => {
					console.log("finished.");
				}).catch(error => {
					console.log(error);
					showMessage(error.message);
				});
			}, function() {
				console.log("Selection cancelled");
			});
		}).catch(function(error) {
			showMessage(error.message);
		});
	}

	let button = $('<input class="rbDecorated" type="button" id="toggl_import" value="Import" style="width:100%; padding-right: 0px; padding-left: 20px; background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpldj0iaHR0cDovL3d3dy53My5vcmcvMjAwMS94bWwtZXZlbnRzIiB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiBoZWlnaHQ9IjUxcHgiIHdpZHRoPSI1MHB4Ij4KPHBhdGggZmlsbD0icmdiKCAyNDMsIDEyLCAyMiApIiBkPSJNMjUsMC45OTkwMDAwMDAwMDAwMiBDMTEuMTkyLDAuOTk5MDAwMDAwMDAwMDIgMCwxMi4xOTAwMDAwMDAwMDAxIDAsMjYgQzAsMzkuODA5IDExLjE5Miw1MSAyNSw1MSBDMzguODA4LDUxIDUwLDM5LjgwOSA1MCwyNiBDNTAsMTIuMTkwMDAwMDAwMDAwMSAzOC44MDgsMC45OTkwMDAwMDAwMDAwMiAyNSwwLjk5OTAwMDAwMDAwMDAyIFpNMjMuMjQ1LDEwLjczMiBDMjMuMjQ1LDEwLjczMiAyNi43NTYsMTAuNzMyIDI2Ljc1NiwxMC43MzIgQzI2Ljc1NiwxMC43MzIgMjYuNzU2LDI4LjE0NiAyNi43NTYsMjguMTQ2IEMyNi43NTYsMjguMTQ2IDIzLjI0NSwyOC4xNDYgMjMuMjQ1LDI4LjE0NiBDMjMuMjQ1LDI4LjE0NiAyMy4yNDUsMTAuNzMyIDIzLjI0NSwxMC43MzIgWk0yNSwzOC44MjA5OTk5OTk5OTk5IEMxOC4yNTUsMzguODIwOTk5OTk5OTk5OSAxMi43ODIsMzMuMzQ4IDEyLjc4MiwyNi42MDIwMDAwMDAwMDAxIEMxMi43ODIsMjAuOTcxIDE2LjU5MSwxNi4yMzM5OTk5OTk5OTk5IDIxLjc3MywxNC44MTQwMDAwMDAwMDAxIEMyMS43NzMsMTQuODE0MDAwMDAwMDAwMSAyMS43NzMsMTguMzY1IDIxLjc3MywxOC4zNjUgQzE4LjQ4MiwxOS42NTU5OTk5OTk5OTk5IDE2LjE1NCwyMi44NTYgMTYuMTU0LDI2LjYwMjAwMDAwMDAwMDEgQzE2LjE1NCwzMS40ODcwMDAwMDAwMDAxIDIwLjExNSwzNS40NSAyNSwzNS40NSBDMjkuODg1LDM1LjQ1IDMzLjg0OCwzMS40ODcwMDAwMDAwMDAxIDMzLjg0OCwyNi42MDIwMDAwMDAwMDAxIEMzMy44NDgsMjIuODU2IDMxLjUxOCwxOS42NTU5OTk5OTk5OTk5IDI4LjIzMSwxOC4zNjUgQzI4LjIzMSwxOC4zNjUgMjguMjMxLDE0LjgxNDAwMDAwMDAwMDEgMjguMjMxLDE0LjgxNDAwMDAwMDAwMDEgQzMzLjQwOSwxNi4yMzM5OTk5OTk5OTk5IDM3LjIxOCwyMC45NzEgMzcuMjE4LDI2LjYwMjAwMDAwMDAwMDEgQzM3LjIxOCwzMy4zNDggMzEuNzQ4LDM4LjgyMDk5OTk5OTk5OTkgMjUsMzguODIwOTk5OTk5OTk5OSBaICIvPgo8L3N2Zz4K); background-size: 16px 16px; background-position: 8px 2px; background-repeat: no-repeat;" tabindex="-1">');

	let span = $('<span class="RadButton RadButton_Metro rbSkinnedButton rbHovered" style="display:inline-block; width:80px; padding: 0; background-color: #f9f9f9; border: 1px solid #cdcdcd;" tabindex="0"></span>').append(button);
	$('#ctl00 > table > tbody > tr:nth-child(2) > td').prepend(span).prepend(messageSpan);

	button.click(importToggl);
});
