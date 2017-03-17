# toggl_import

Chrome extension for importing a single day from toggle to soncoso daily time record.

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


## Usage

- Go to soncoso and start the time tracking for a single day
- On the third page (when asked to enter your time entries) an additional button for the import will appear on the button of the dialog
- Press it to start the import

![](screenshots/screenshot_usage_1.png)

- After the time entries for the selected day have been loaded you will be asked to select all projects to import

![](screenshots/screenshot_usage_2.png)

- After pressing continue all time entries for the selected projects will be added to the list

![](screenshots/screenshot_usage_3.png)

- You can continue the time tracking as usual
