# Change Log

## [1.0.0 - 1.0.7] - 2016-06-29 - 2016-07-14
- Initial releases

## [1.1.0] - 2021-10-19
- Updated extension to latest standards
- Fix bug where extension failed on attempted os-level copy on non-darwin systems, breaking ssh-remoting to linux systems.

## [1.1.1] - 2023-02-25
- Configured to prefer running on local client when using remote ssh connection, fixing the random loss of mark selection.
- Fixed https://github.com/naturalethic/nemacs/issues/3
- Fixed https://github.com/naturalethic/nemacs/issues/4

## [1.1.2] - 2023-03-02
- Fixed a bug where cancelling (ctrl-g) after having begun a mark, but not moving the cursor, did not cancel mark mode.
