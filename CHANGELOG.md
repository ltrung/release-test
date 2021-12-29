# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2021-12-29
    
### Added
    
### Removed
    
### Changed
    
### Fixed
    
## [1.1.0] - 2021-12-29
    
### Added
    
### Removed
    
### Changed
    
### Fixed
    
## [1.0.0] - 2021-12-17

### Added
- Add `supportDownlinkBandwidthEstimation` API to check whether browsers support downlink bandwidth estimation 
  which requires for priority based downlink policy to work.
- Add `keepLastFrameWhenPaused` in `DefaultVideoTile` as an option to keep last frame when pausing a video tile.
- Add error name for custom device controller error.
- Added pagination option to meeting demo when priority downlink policy is used.
- Add `ApplicationMetadata` to enable builders to send their application name or version to the Amazon Chime backend. This is an opt-in addition.
- Add a new `AudioProfile` called `fullbandMusicStereo` which can be passed into `setAudioProfile` to support sending and recieving stereo audio through main audio input and output. This can also be passed into `setContentAudioProfile` to support sending stereo audio as content
- [Demo] Add new checbox on join screen to select new `fullbandMusicStereo` audio profile
- [Demo] Add new dropdown items in microphone dropdown menu to test sending stereo audio as main audio input
- [Demo] Add new dropdown items in content share dropdown menu to test sending stereo audio as content

### Removed

### Fixed
- Fixed updates to mutable state during subscribe leading to non-existant/frozen video streams.
- Fixed inconsistent default maxBitrate values in the NScaleVideoUplinkBandwithPolicy constructor leading to the default ideal max bitrate not being honored.

### Changed
- Clarified comment in `DefaultSimulcastUplinkPolicy`.