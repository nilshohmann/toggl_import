var ImportUI = window.ImportUI || {};

(function() {

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
	function createSelectionEntry([name, color, projectPrefix]) {
		const id = name.replace(" ", "_");
		return '<input type="checkbox" id="'+ id +'" name="'+ name +'" value="" style="margin: 8px; width: 20px; height: 16px;">' +
			'<label for="'+ id +'" style="font-size: 14px; line-height: 20px;" title="' + name + '">' +
				'<div style="position: relative; top: 2px; width: 14px; height: 14px; background: '+ color +'; display: inline-flex; margin-right: 6px; border-radius: 7px;"></div>' +
				'<span style="display: inline-block; width: 256px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; vertical-align: middle;">' + name + '</span>' +
			'</label>' +
			'<input type="checkbox" class="project-prefix" id="'+ id +'_prefix" name="'+ name +'_prefix" value=""'+ (projectPrefix ? ' checked>' : '>') +
			'<label for="'+ id +'_prefix" title="Add prefix for this project"><span></span></label>';
	}

	/*
	 * Indicates whether the project chooser dialog is currently shown
	 */
	ImportUI.chooserDialogIsShown = function() {
		return $("#ProjectChooser").length > 0;
	};

	/*
	 * Show the project chooser dialog
	 */
	ImportUI.showChooserDialog = function(items) {
		console.debug("Create project chooser dialog");

		function setupDateSelection(parent) {
			const dateSelection = $(dateSelectionHtml);
			parent.prepend(dateSelection);
		}

		function setupDialog() {
			return new Promise(function(resolve, reject) {
				const chooserDialog = $(dialogHTML);

				chooserDialog.find(".rwTitlebar a").click(function(event) {
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

				const form = chooserDialog.find("form");
				if (items.length == 0) {
					form.html(noProjectsHtml);
				} else {
					const formItems = items.map(createSelectionEntry).join('<hr style="margin: 0px; background: black;">');
					form.html(formItems);
				}
				// setupDateSelection(form.parent());

				$("body").append(chooserDialog);
			});
		}

		return setupDialog();
	};
})();
