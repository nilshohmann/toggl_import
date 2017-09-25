
var TogglImport = window.TogglImport || {};
TogglImport.util = TogglImport.util || {};

(function() {

	/*
	 * Sleep function
	 */
  TogglImport.util.sleep = function(time) {
		return new Promise(resolve => setTimeout(resolve, time));
	};

  /*
   * Format date object in HH:mm format
   */
  TogglImport.util.formatTime = function(date) {
    const granularity = 5 * 60 * 1000;
    date = new Date((new Date(date).getTime() / granularity | 0) * granularity);
    return ("0" + date.getHours()).substr(-2) +":"+ ("0" + date.getMinutes()).substr(-2);
  };

  /*
   * Format date object in yyyy:MM:dd format
   */
	TogglImport.util.formatDate = function(date) {
    date = new Date(date);
		return date.getFullYear() +"-"+ ("0" + (date.getMonth()+1)).substr(-2) +"-"+ ("0" + date.getDate()).substr(-2);
	};

  /*
   * Returns the dates for monday and sunday for the current week
   */
	TogglImport.util.currentWeekRange = function() {
		function addDays(date, days) {
			var d = new Date(date.valueOf());
			d.setDate(d.getDate() + days);
			return d;
		}

		const now = new Date();
		const monday = addDays(now, -(now.getDay()+6)%7)
		const sunday = addDays(monday, 6);

		return [TogglImport.util.formatDate(monday), TogglImport.util.formatDate(sunday)];
	};

  /*
   * Returns a distinct list of projects from a given list of time entries
   */
  TogglImport.util.getProjects = function(entries) {
    return TogglImport.getValue("project_prefixes").then(projectPrefixes => {
      console.debug("Project prefixes:", projectPrefixes);

  		const projectNames = entries.map(e => e["fullProjectName"]);
  		return entries.filter((e, i) => {
  			return projectNames.indexOf(e.fullProjectName) === i;
  		}).map(e => {
  			return {
          'name': e["fullProjectName"],
          'color': e["color"],
          'prefix': projectPrefixes[e["fullProjectName"]] == true
        };
  		});
    });
  };

  /*
   * Update the stored project prefixes
   */
  TogglImport.util.updateProjectPrefixes = function(projects) {
    return TogglImport.getValue("project_prefixes").then(projectPrefixes => {
      projects.forEach(p => projectPrefixes[p["name"]] = p["prefix"]);
      chrome.storage.local.set({"project_prefixes": projectPrefixes}, function() {});
      return projects;
    });
  };

})();
