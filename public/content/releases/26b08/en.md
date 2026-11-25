# Lingmo OS 5.0 26b08 (Lithium)

**Release Date:** November 25, 2026

### New Features

- Added a Recheck action below Update now in Settings when an update is available.
- Added a Stage Manager switch in Settings. The preference is persisted as `StageManager/Enabled` and applied by the compositor preference watcher.

### Updates

- Updated Aurora to version `1.1.12` and synchronized the Debian package version.
- The About page now reads the installed Aurora version from the `aurora-version` metadata.
- Stage Manager is disabled by default when no user preference has been saved; explicit preferences are preserved.

### Optimizations

- Refined Stage Manager cards with full-card thumbnails, overlaid application icons, alternating tilt and recent-use ordering.

### Bug Fixes

- Notification banners no longer dismiss the launcher while appearing as non-interactive overlays.
- Clicking empty launcher space after renaming a folder commits the rename without closing the launcher.
- The file manager Properties dialog now sizes itself to its content and centers the page content.

### Scope

This release note covers the published package changes in the 26b08 batch. The pending Stage Manager implementation and architecture research remain outside the published feature list.
