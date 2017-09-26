# Toggl Import

Chrome extension for importing a single day from toggl to soncoso daily time record.

## Installation

- Clone this repository
- Open Chrome and navigate to "chrome://extensions"
- Enable the developer mode
- Press "Load unpacked extension..." and select the extension folder (containing the manifest.json)

![](screenshots/screenshot_install_1.png)

- You should now see the extension in the list
- You can disable the developer mode now
- You can press "Update" to reload the extension on updates

![](screenshots/screenshot_install_2.png)

## Setup

- Go to toggl and open your profile settings

![](screenshots/screenshot_setup_1.png)

- Scroll down to API key and copy it

![](screenshots/screenshot_setup_2.png)

- Open the extension popup
- Paste the API key
- Press update to get your workspace id

![](screenshots/screenshot_setup_3.png)

- Additionally there's the option to automatically import all time entries for a day when there is only one project listed for this day.

## Usage

- Go to soncoso and start the time tracking for a single day
- On the third page (when asked to enter your time entries) an additional button for the import will appear on the bottom of the dialog
- Press it to start the import

![](screenshots/screenshot_usage_1.png)

- After the time entries for the selected day have been loaded you will be asked to select all projects to import
- The right checkbox offers the possibility to include the project name as a prefix for the description of all related entries (e.g. `[Project 1] Ticket 1`), this option will be saved and automatically set in further imports

![](screenshots/screenshot_usage_2.png)

- After pressing continue all time entries for the selected projects will be added to the list

![](screenshots/screenshot_usage_3.png)

- You can continue the time tracking as usual

### Automatic import

- Open the project details view on the project overview page
- Click on the "auto import" button

![](screenshots/screenshot_autoimport.png)

- Projects for the current week are preloaded, to select a different time range enter the begin and end date and click on the refresh button
- Select all projects to import for the selected soncoso project and click on continue
- The import will automatically proceed to the third page and all time entries for this day will be filled in the form
- Validate the data and continue the time tracking manually (including the next confirm page)
- The import page will then automatically closed and restarted with the next day to import if available

- The automatic import can be cancelled in the extension popup

![](screenshots/screenshot_cancel_autoimport.png)

## Changelog

### 1.1.0

- Added semi-automatic import functionality for a complete project
- Further improvements

### 1.0.3

- Added support for project prefix for time entries

### 1.0.2

- Added direct import for a single day if only one project is available

### 1.0.1

- Bug fixes

### 1.0.0

- Initial project
