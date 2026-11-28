# Lingmo OS 5.0 26b08 (Lithium)

**Release Date:** November 28, 2026

### New Features

- Added a "Recheck" action below "Update Now" on the Updates page in Settings when updates are detected.
- Added a Stage Manager toggle in Settings. Its configuration is saved as `StageManager/Enabled` and applied immediately by the compositor preference listener.
- Added a "Control Style" selection in Settings.
- Introduced the "Efficiency Mode" interface.

### Updates

- Updated the kernel to 7.3.4.
- Updated the Photos app.
- Updated the Clock app.
- Updated Aurora to `1.2.3` and synchronized the Debian package version.
- Changed the About page to read the installed `aurora-version` metadata.
- Stage Manager is now disabled by default when no user preference has been saved. Explicitly saved preferences remain unchanged.
- Updated Debian to 13.8.

### Improvements

- Improved Stage Manager cards with full-card thumbnails, overlaid application icons, alternating tilt effects, and sorting by most recently used.

### Bug Fixes

- Fixed an issue where system notifications displayed as non-interactive overlays would close the launcher.
- Fixed an issue where clicking an empty area of the launcher after renaming a folder would only commit the rename without closing the launcher.
- Updated the file manager's properties window to resize according to its content and center the page content.
- Fixed a desktop crash caused by opening the properties window.
- Fixed an issue that prevented the video player from playing videos correctly.

### Release Scope

These release notes cover software package changes published in the 26b08 batch.