
$(document).ready(function() {

	/*
		Animation stuff
	*/
	$(".flp label").each(function() {
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
		Helper
	*/
	function setValue(value, textField) {
		if (!value) { value = ""; }

		textField.val(value);

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

		if (message.length > 0) {
			setTimeout(function() {
				errorMessageContainer.html("");
			}, 5000);
		}
	}


	/*
		Initializing
	*/
	getValue("api_token").then(apiToken => setValue(apiToken, $("#api_token")));
	getValue("workspace_id").then(workspaceID => setValue(workspaceID, $("#workspace_id")));
	getValue("auto_import").then(autoImport => $("#auto_import").prop("checked", autoImport));


	/*
		Button actions and change events
	*/
	$("#save_api_token").on('click', function() {
		const apiToken = $("#api_token").val();
		chrome.storage.local.set({"api_token": apiToken}, function() {});
	});

	$("#api_token").keyup(function(event) {
		if (event.keyCode == 13) {
			$("#save_api_token").focus();
			$("#save_api_token").click();
		}
	});

	$("#refresh_workspace_id").on('click', function() {
		showMessage("");
		const apiToken = $("#api_token").val();
		chrome.storage.local.set({"api_token": apiToken}, function() {});

		if (apiToken.length == 0) {
			$("#api_token").focus()
			showMessage("API token not set.");
			return
		}

		$("#workspace_id").val("");
		loadWorkspace(apiToken).then(workspaceID => {
			setValue(workspaceID, $("#workspace_id"));
			chrome.storage.local.set({"workspace_id": workspaceID}, function() {});
		}).catch(showError);
	});

	$("#save_workspace_id").on('click', function() {
		const workspaceID = $("#workspace_id").val();
		chrome.storage.local.set({"workspace_id": workspaceID}, function() {});
	});

	$("#workspace_id").keyup(function(event) {
		if (event.keyCode == 13) {
			$("#save_workspace_id").focus();
			$("#save_workspace_id").click();
		}
	});
	
	$("#auto_import").change(function() {
		const checked = $(this).is(":checked");
		chrome.storage.local.set({"auto_import": checked}, function() {});
	});
});
