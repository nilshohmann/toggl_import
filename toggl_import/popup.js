
$(function() {

	/*
	 * Animation stuff
	 */
	$(".flp .text-label").each(function() {
		$(this).html('<span class="ch">' + $(this).html().split("").join('</span><span class="ch">') + '</span>');
		$(".ch:contains(' ')").html("&nbsp;");
	});

	$(".flp input[type=text]").focus(function() {
		const tm = $(this).outerHeight()/2 * -1 + "px";
		$(this).next().addClass("focussed").children().stop(true).each(function(i) {
			$(this).delay(i * 50).animate({top: tm}, 200, 'easeOutBack');
		});
	});

	$(".flp input[type=text]").blur(function() {
		if ($(this).val() == "") {
			$(this).next().removeClass("focussed").children().stop(true).each(function(i) {
				$(this).delay(i * 50).animate({top: 0}, 500, 'easeInOutBack');
			});
		}
	});

	/*
	 * Helper
	 */
	function setText(text, textField) {
		if (!text) { text = ""; }

		textField.val(text);

		var tm = "0px";
		if (textField.val().length > 0) {
			textField.next().addClass("focussed");
			tm = $(textField).outerHeight()/2 * -1 + "px";
		}

		textField.next().children().stop(true).each(function(i) {
			$(this).css({top: tm});
		});
	}

	function showError(error) {
		showMessage(error.message);
	}

	function showMessage(message) {
		const errorMessageContainer = $("#error_message");
		errorMessageContainer.html(message);

		if (message.length == 0) {
			errorMessageContainer.addClass("hidden");
		} else {
			errorMessageContainer.removeClass("hidden");

			setTimeout(function() {
				errorMessageContainer.html("");
				errorMessageContainer.addClass("hidden");
			}, 5000);
		}
	}

	/*
	 * Initializing
	 */
 	$("#version").text(chrome.runtime.getManifest().version);
	TogglImport.getValue("api_token", "workspace_id", "direct_import", "auto_import").then(([apiToken, workspaceID, directImport, autoImport]) => {
		setText(apiToken, $("#api_token"));
		setText(workspaceID, $("#workspace_id"));
		$("#direct_import").prop("checked", directImport);
		if (autoImport) {
			$("#cancel_auto_import").parent().removeClass("hidden");
		}
	});


	/*
	 * Button actions and change events
	 */
	$("#save_api_token").click(function() {
		const apiToken = $("#api_token").val();
		TogglImport.setValue("api_token", apiToken);
	});

	$("#api_token").keyup(function(event) {
		if (event.keyCode == 13) {
			$("#save_api_token").focus();
			$("#save_api_token").click();
		}
	});

	$("#refresh_workspace_id").click(function() {
		showMessage("");
		const apiToken = $("#api_token").val();
		TogglImport.setValue("api_token", apiToken);

		if (apiToken.length == 0) {
			$("#api_token").focus()
			showMessage("API token not set.");
			return
		}

		$("#workspace_id").val("");
		TogglImport.loadWorkspace(apiToken).then(workspaceID => {
			setText(workspaceID, $("#workspace_id"));
			TogglImport.setValue("workspace_id", workspaceID);
		}).catch(showError);
	});

	$("#save_workspace_id").click(function() {
		const workspaceID = $("#workspace_id").val();
		TogglImport.setValue("workspace_id", workspaceID);
	});

	$("#workspace_id").keyup(function(event) {
		if (event.keyCode == 13) {
			$("#save_workspace_id").focus();
			$("#save_workspace_id").click();
		}
	});

	$("#direct_import").change(function() {
		const checked = $(this).is(":checked");
		TogglImport.setValue("direct_import", checked);
	});

	$("#cancel_auto_import").click(function() {
		TogglImport.setValue("auto_import", false);
		$("#cancel_auto_import").parent().addClass("hidden");
	});
});
