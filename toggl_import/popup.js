
$(document).ready(function() {

	/*
		Animation stuff
	*/
	$(".flp label").each(function() {
		var sop = '<span class="ch">';
		var scl = '</span>';

		//split the label into single letters and inject span tags around them
		$(this).html(sop + $(this).html().split("").join(scl+sop) + scl);

		//to prevent space-only spans from collapsing
		$(".ch:contains(' ')").html("&nbsp;");
	});

	var d;

	$(".flp input[type=text]").focus(function() {
		//calculate movement for .ch = half of input height
		var tm = $(this).outerHeight()/2 *-1 + "px";
		$(this).next().addClass("focussed").children().stop(true).each(function(i) {
			d = i*50; //delay
			$(this).delay(d).animate({top: tm}, 200, 'easeOutBack');
		});
	});

	$(".flp input[type=text]").blur(function() {
		//animate the label down if content of the input is empty
		if ($(this).val() == "") {
			$(this).next().removeClass("focussed").children().stop(true).each(function(i) {
				d = i*50;
				$(this).delay(d).animate({top: 0}, 500, 'easeInOutBack');
			});
		}
	});


	/*
		Initializing
	*/
	function setValue(value, textField) {
		if (!value) { value = ""; }

		textField.val(value);

		var tm = "0px";
		if (textField.val().length > 0) {
			textField.next().addClass("focussed")
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
		let errorMessageContainer = $("#error_message");
		errorMessageContainer.html(message);

		if (message.length > 0) {
			setTimeout(function() {
				errorMessageContainer.html("");
			}, 5000);
		}
	}

	getValue("api_token").then(apiToken => setValue(apiToken, $("#api_token")));
	getValue("workspace_id").then(workspaceID => setValue(workspaceID, $("#workspace_id")));


	/*
		Button actions
	*/
	$("#save_api_token").on('click', function() {
		let apiToken = $("#api_token").val();
		chrome.storage.local.set({"api_token": apiToken}, function() {});
	});

	$("#api_token").keyup(function(event) {
		if(event.keyCode == 13) {
			$("#save_api_token").focus();
			$("#save_api_token").click();
		}
	});

	$("#refresh_workspace_id").on('click', function() {
		showMessage("");
		let apiToken = $("#api_token").val();
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
		let workspaceID = $("#workspace_id").val();
		chrome.storage.local.set({"workspace_id": workspaceID}, function() {});
	});

	$("#workspace_id").keyup(function(event) {
		if(event.keyCode == 13) {
			$("#save_workspace_id").focus();
			$("#save_workspace_id").click();
		}
	});
});
