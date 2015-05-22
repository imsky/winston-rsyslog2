# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [0.0.5] - 2015-05-22

### Changed

- Improved README and Changelog formatting. (Mark Stosberg)

### Fixed

- Repaired testing function broken in 0.0.4. (Mark Stosberg)

## [0.0.4] - 2015-05-22

### Fixed

- license is now clarified in package.json

### Added

 - `timeout` option for TCP timeout. Default value is 2000 ms, which was the prior hardcoded behavior. (Aleksey verkholantsev)
 - `dateProvider` option to generate a different date string. Default behavior is backwards compatible.  (Aleksey verkholantsev)
 - `messageProvider` option to customize the message string forfmatting. (Aleksey verkholantsev)
 - `levelMapping` option to map winston logging levels to rsyslog

## [0.0.2] - 2015-05-20

### Changed

- First release as fork from winston-rsyslog2.

### Fixed

- Dependency on winston was changed to be ">=" so it can be used with newer versions of wiston.
