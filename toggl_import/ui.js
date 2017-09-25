
var TogglImport = window.TogglImport || {};
TogglImport.ui = TogglImport.ui || {};

(function() {

	/*
	 * Raw data for the toggl icon
	 */
	const toggl_icon = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpldj0iaHR0cDovL3d3dy53My5vcmcvMjAwMS94bWwtZXZlbnRzIiB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiBoZWlnaHQ9IjUxcHgiIHdpZHRoPSI1MHB4Ij4KPHBhdGggZmlsbD0icmdiKCAyNDMsIDEyLCAyMiApIiBkPSJNMjUsMC45OTkwMDAwMDAwMDAwMiBDMTEuMTkyLDAuOTk5MDAwMDAwMDAwMDIgMCwxMi4xOTAwMDAwMDAwMDAxIDAsMjYgQzAsMzkuODA5IDExLjE5Miw1MSAyNSw1MSBDMzguODA4LDUxIDUwLDM5LjgwOSA1MCwyNiBDNTAsMTIuMTkwMDAwMDAwMDAwMSAzOC44MDgsMC45OTkwMDAwMDAwMDAwMiAyNSwwLjk5OTAwMDAwMDAwMDAyIFpNMjMuMjQ1LDEwLjczMiBDMjMuMjQ1LDEwLjczMiAyNi43NTYsMTAuNzMyIDI2Ljc1NiwxMC43MzIgQzI2Ljc1NiwxMC43MzIgMjYuNzU2LDI4LjE0NiAyNi43NTYsMjguMTQ2IEMyNi43NTYsMjguMTQ2IDIzLjI0NSwyOC4xNDYgMjMuMjQ1LDI4LjE0NiBDMjMuMjQ1LDI4LjE0NiAyMy4yNDUsMTAuNzMyIDIzLjI0NSwxMC43MzIgWk0yNSwzOC44MjA5OTk5OTk5OTk5IEMxOC4yNTUsMzguODIwOTk5OTk5OTk5OSAxMi43ODIsMzMuMzQ4IDEyLjc4MiwyNi42MDIwMDAwMDAwMDAxIEMxMi43ODIsMjAuOTcxIDE2LjU5MSwxNi4yMzM5OTk5OTk5OTk5IDIxLjc3MywxNC44MTQwMDAwMDAwMDAxIEMyMS43NzMsMTQuODE0MDAwMDAwMDAwMSAyMS43NzMsMTguMzY1IDIxLjc3MywxOC4zNjUgQzE4LjQ4MiwxOS42NTU5OTk5OTk5OTk5IDE2LjE1NCwyMi44NTYgMTYuMTU0LDI2LjYwMjAwMDAwMDAwMDEgQzE2LjE1NCwzMS40ODcwMDAwMDAwMDAxIDIwLjExNSwzNS40NSAyNSwzNS40NSBDMjkuODg1LDM1LjQ1IDMzLjg0OCwzMS40ODcwMDAwMDAwMDAxIDMzLjg0OCwyNi42MDIwMDAwMDAwMDAxIEMzMy44NDgsMjIuODU2IDMxLjUxOCwxOS42NTU5OTk5OTk5OTk5IDI4LjIzMSwxOC4zNjUgQzI4LjIzMSwxOC4zNjUgMjguMjMxLDE0LjgxNDAwMDAwMDAwMDEgMjguMjMxLDE0LjgxNDAwMDAwMDAwMDEgQzMzLjQwOSwxNi4yMzM5OTk5OTk5OTk5IDM3LjIxOCwyMC45NzEgMzcuMjE4LDI2LjYwMjAwMDAwMDAwMDEgQzM3LjIxOCwzMy4zNDggMzEuNzQ4LDM4LjgyMDk5OTk5OTk5OTkgMjUsMzguODIwOTk5OTk5OTk5OSBaICIvPgo8L3N2Zz4K`;

	/*
	 * HTML for project chooser dialog
	 */
	const dialogHTML = `<div id="ProjectChooser" class="RadWindow_Metro" unselectable="on" style="position: absolute; width: 380px; left: 50%; top: 50%; z-index: 9999999; margin-left: -180px; margin-top: -80px; padding: 1px; border: 0; background: white;">
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
	#ProjectChooser input[type=button] {
		position: relative;
		background-color: #f9f9f9;
		border: 1px solid #ccc;
		padding: 0 !important;
		height: 20px;
		cursor: pointer;
	}
	#ProjectChooser input[type=button]:hover {
		background: #e5e5e5;
	}
</style>
<table cellspacing="0" cellpadding="0" style="height: 100%; width: 100%;">
<tr>
	<td class="rwTopLeft" style="width: 4px;"></td>
	<td class="rwTitlebar" style="padding-left: 4px; height: 31px; font-size: 16px; color: white;">
		Choose projects
		<ul class="" style="width: 32px; float: right; list-style: none; margin: 0px; padding: 0px;"><li>
			<a title="Close" style="width: 29px; height: 18px; display: block; background-image: url(/Img/theme/Skin/Window/CommandButtonSprites.gif); background-position: -90px -1px;"></a>
		</li></ul>
	</td>
	<td class="rwTopRight" style="width: 4px"></td>
</tr>
<tr>
	<td class="rwBodyLeft"></td>
	<td style="background-color: white;">

		<form></form>

		<hr style="margin: 0px; background: black;">
		<input type="button" class="RadButton RadButton_Metro rbSkinnedButton" value="Continue" style="margin-left: 4px; width: 80px; margin: 8px -40px; left: 50%;">
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
	 * HTML for the text that shows when no entries are available
	 */
	const noProjectsHtml = '<div style="margin: 8px">No projects found</div>';

	/*
	 * HTML for the date selection
	 */
	const dateSelectionHtml = `<div style="text-align: center;">
	<input type="date" id="StartDate" name="StartDate" style="margin: 8px; height: 16px; width: 128px;">
	<span style="font-size: 14px; line-height: 20px;">-</span>
	<input type="date" id="EndDate" name="EndDate" style="margin: 8px; height: 16px; width: 128px;">
	<input type="button" class="RadButton RadButton_Metro rbSkinnedButton" id="UpdateEntries" value="↺" style="margin: 6px; width: 24px;">
</div>
<hr style="margin: 0px; background: black;">`;

	/*
	 * Create a project entry for the chooser dialog
	 */
	function createSelectionEntry(entry) {
		const id = entry.name.replace(" ", "_");
		return '<input type="checkbox" id="'+ id +'" name="'+ entry.name +'" value="" style="margin: 8px; width: 20px; height: 16px;">' +
			'<label for="'+ id +'" style="font-size: 14px; line-height: 20px;" title="' + entry.name + '">' +
				'<div style="position: relative; top: 2px; width: 14px; height: 14px; background: '+ entry.color +'; display: inline-flex; margin-right: 6px; border-radius: 7px;"></div>' +
				'<span style="display: inline-block; width: 256px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; vertical-align: middle;">' + entry.name + '</span>' +
			'</label>' +
			'<input type="checkbox" class="project-prefix" id="'+ id +'_prefix" name="'+ entry.name +'_prefix" value=""'+ (entry.prefix ? ' checked>' : '>') +
			'<label for="'+ id +'_prefix" title="Add prefix for this project"><span></span></label>';
	}

	/*
	 * Creates the button for the daily import
	 */
	TogglImport.ui.buildImportButton = function() {
		return $('<input class="rbDecorated" type="button" id="toggl_import" value="Import" style="width:100%; padding-right: 0px; padding-left: 20px; background-image: url(' + toggl_icon + '); background-size: 16px 16px; background-position: 8px 2px; background-repeat: no-repeat;" tabindex="-1">');
	}

	/*
	 * Creates the button for the automatic import
	 */
	TogglImport.ui.buildAutoImportButton = function() {
		return $('<li class="rtbBtn" style="display: inline-block;"><a title="Automatic import" class="rtbWrap" href="#"><span class="rtbMid"><span class="rtbIn"><img alt="Auto import" src="' + toggl_icon + '" class="rtbIcon" width="20"></span><span class="rtbIn">Auto import</span></span></a></li>');
	}

	/*
	 * Indicates whether the project chooser dialog is currently shown
	 */
	TogglImport.ui.chooserDialogIsShown = function() {
		return $("#ProjectChooser").length > 0;
	};

	/*
	 * Show the project chooser dialog
	 */
	TogglImport.ui.showChooserDialog = function(projectQuery, multipleDays) {
		console.debug("Create project chooser dialog");

		return new Promise(function(resolve, reject) {
			const chooserDialog = $(dialogHTML);
			const form = chooserDialog.find("form");

			let projects = [];
			function buildProjectList(p) {
				projects = p;
				if (projects.length == 0) {
					form.html(noProjectsHtml);
				} else {
					const formItems = projects.map(createSelectionEntry).join('<hr style="margin: 0px; background: black;">');
					form.html(formItems);
				}
			}

			function onError(error) {
				chooserDialog.remove();
				reject(error);
			}

			function buildDateSelection(currentWeekDate) {
				const dateSelection = $(dateSelectionHtml);
				dateSelection.find("#StartDate").val(currentWeekDate[0]);
				dateSelection.find("#EndDate").val(currentWeekDate[1]);

				dateSelection.find("#UpdateEntries").click(function () {
					const beginDate = dateSelection.find("#StartDate").val();
					const endDate = dateSelection.find("#EndDate").val();
					projectQuery(beginDate, endDate).then(buildProjectList, onError);
				});
				return dateSelection;
			}

			chooserDialog.find(".rwTitlebar a").click(function(event) {
				event.preventDefault();
				onError();
			});

			chooserDialog.find("input[type=button]").click(function() {
				const formData = chooserDialog.find("form").serialize();
				let selectedValues = [];
				if (formData.length > 0) {
					selectedValues = formData.replace(new RegExp("=", 'g'), "").split("&").map(decodeURIComponent);
				}

				projects.forEach(p => {
					p["prefix"] = selectedValues.indexOf(p["name"] + "_prefix") != -1;
					p["selected"] = selectedValues.indexOf(p["name"]) != -1;
				});

				chooserDialog.remove();
				resolve(projects);
			});

			console.log("ProjectQuery:", typeof(projectQuery));

			if (typeof(projectQuery) == "function") {
				const currentWeekDate = TogglImport.util.currentWeekRange();
				form.parent().prepend(buildDateSelection(currentWeekDate));
				projectQuery(currentWeekDate[0], currentWeekDate[1]).then(buildProjectList, onError);
			} else {
				buildProjectList(projectQuery);
			}


			$("body").append(chooserDialog);
		});
	};
})();
