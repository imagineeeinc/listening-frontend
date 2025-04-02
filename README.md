# listening frontend
a listenbrainz frontend using the listenbrainz public api to watch users live music playback and recent history.

## Features
- View live currently playing song with dynamic colour (now playing widget).
- View last 40 listens, links to artist and recording/ release on musicbrainz for viewing.
- Enlarge now playing widget.
- Full screen now playing widget by holding the expand button for 0.5 seconds.
- Open the now playing widget in kiosk mode for always enlarged view. Add `?kiosk=true` to the end of the url to enable.
- Iframe now playing widget ensuring the now playing widget fills the viewport. Add `?iframe=true` to the end of the url to enable.
- Screen Wake Lock, so the screen is on and can display the now playing widget. Useful if you turn a second device into a now playing widget.
- Uses [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API), [ListenBrainz](https://listenbrainz.readthedocs.io/en/latest/) and [Cover Art archive](https://musicbrainz.org/doc/Cover_Art_Archive/API) Public api. **Note**: the cover art detection is not the most accurate and can give incorrect cover art.
