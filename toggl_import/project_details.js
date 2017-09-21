
$(function() {
	const extensionId = JSON.stringify(chrome.runtime.id);
	const version = chrome.runtime.getManifest().version;
	console.debug("Extension " + extensionId +" (" + version + "): project_details loaded!!!");

	TogglImport.setValue("auto_import", false);

	function currentWeekRange() {
		function formatDate(date) {
			return date.getFullYear() +"-"+ ("0" + (d.getMonth()+1)).substr(-2) +"-"+ ("0" + date.getDate()).substr(-2);
		}

		function addDays(date, days) {
			var d = new Date(date.valueOf());
			d.setDate(d.getDate() + days);
			return d;
		}

		const now = new Date();
		const monday = addDays(now, -(now.getDay()+6)%7)
		const sunday = addDays(monday, 6);

		return [formatDate(monday), formatDate(sunday)];
	}

	function selectProjectsToImport() {
    ImportUI.showChooserDialog([]);
	}

	/*
	 * Start the automatic import
	 */
	function startAutoImport() {
		console.log("Starting auto import...");

		TogglImport.setValue("auto_import", true);
		$(".rtbSlide .RadToolBarDropDown ul li a span:contains(Tageszeiterfassung)").click();
	}

	/*
	 * Setup UI for auto import
	 */
	function setupAutoImportButton() {
		const seperator = $('<li class="rtbSeparator"><span class="rtbText"></span></li>');
		const button = $('<li class="rtbBtn" style="display: inline-block;"><a title="Automatic import" class="rtbWrap" href="#"><span class="rtbMid"><span class="rtbIn"><img alt="Auto import" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpldj0iaHR0cDovL3d3dy53My5vcmcvMjAwMS94bWwtZXZlbnRzIiB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiBoZWlnaHQ9IjUxcHgiIHdpZHRoPSI1MHB4Ij4KPHBhdGggZmlsbD0icmdiKCAyNDMsIDEyLCAyMiApIiBkPSJNMjUsMC45OTkwMDAwMDAwMDAwMiBDMTEuMTkyLDAuOTk5MDAwMDAwMDAwMDIgMCwxMi4xOTAwMDAwMDAwMDAxIDAsMjYgQzAsMzkuODA5IDExLjE5Miw1MSAyNSw1MSBDMzguODA4LDUxIDUwLDM5LjgwOSA1MCwyNiBDNTAsMTIuMTkwMDAwMDAwMDAwMSAzOC44MDgsMC45OTkwMDAwMDAwMDAwMiAyNSwwLjk5OTAwMDAwMDAwMDAyIFpNMjMuMjQ1LDEwLjczMiBDMjMuMjQ1LDEwLjczMiAyNi43NTYsMTAuNzMyIDI2Ljc1NiwxMC43MzIgQzI2Ljc1NiwxMC43MzIgMjYuNzU2LDI4LjE0NiAyNi43NTYsMjguMTQ2IEMyNi43NTYsMjguMTQ2IDIzLjI0NSwyOC4xNDYgMjMuMjQ1LDI4LjE0NiBDMjMuMjQ1LDI4LjE0NiAyMy4yNDUsMTAuNzMyIDIzLjI0NSwxMC43MzIgWk0yNSwzOC44MjA5OTk5OTk5OTk5IEMxOC4yNTUsMzguODIwOTk5OTk5OTk5OSAxMi43ODIsMzMuMzQ4IDEyLjc4MiwyNi42MDIwMDAwMDAwMDAxIEMxMi43ODIsMjAuOTcxIDE2LjU5MSwxNi4yMzM5OTk5OTk5OTk5IDIxLjc3MywxNC44MTQwMDAwMDAwMDAxIEMyMS43NzMsMTQuODE0MDAwMDAwMDAwMSAyMS43NzMsMTguMzY1IDIxLjc3MywxOC4zNjUgQzE4LjQ4MiwxOS42NTU5OTk5OTk5OTk5IDE2LjE1NCwyMi44NTYgMTYuMTU0LDI2LjYwMjAwMDAwMDAwMDEgQzE2LjE1NCwzMS40ODcwMDAwMDAwMDAxIDIwLjExNSwzNS40NSAyNSwzNS40NSBDMjkuODg1LDM1LjQ1IDMzLjg0OCwzMS40ODcwMDAwMDAwMDAxIDMzLjg0OCwyNi42MDIwMDAwMDAwMDAxIEMzMy44NDgsMjIuODU2IDMxLjUxOCwxOS42NTU5OTk5OTk5OTk5IDI4LjIzMSwxOC4zNjUgQzI4LjIzMSwxOC4zNjUgMjguMjMxLDE0LjgxNDAwMDAwMDAwMDEgMjguMjMxLDE0LjgxNDAwMDAwMDAwMDEgQzMzLjQwOSwxNi4yMzM5OTk5OTk5OTk5IDM3LjIxOCwyMC45NzEgMzcuMjE4LDI2LjYwMjAwMDAwMDAwMDEgQzM3LjIxOCwzMy4zNDggMzEuNzQ4LDM4LjgyMDk5OTk5OTk5OTkgMjUsMzguODIwOTk5OTk5OTk5OSBaICIvPgo8L3N2Zz4K" class="rtbIcon" width="20"></span><span class="rtbIn">Auto import</span></span></a></li>');

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
