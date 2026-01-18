# Cinefill

Remove letterbox bars and fill your ultrawide screen on streaming services.

## What it does

Many movies on streaming services are filmed in cinematic aspect ratios (2.39:1, 21:9) but display with black bars on ultrawide monitors. Cinefill scales the video to fill your screen, removing the letterbox bars.

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the folder

## Usage

1. Navigate to a supported streaming site and start playing a video
2. Click the extension icon in your toolbar
3. Toggle the switch to enable/disable
4. Adjust the zoom level using the slider or preset buttons:
   - **1.0x** - No scaling (original)
   - **21:9** - 1.33x (standard ultrawide)
   - **2.39:1** - 1.43x (cinematic)

Your settings are saved automatically.

## Supported sites

- Max (max.com)
- Netflix (netflix.com)
- Disney+ (disneyplus.com)
- Amazon Prime Video (primevideo.com)
- Apple TV+ (tv.apple.com)
- Hulu (hulu.com)
- Paramount+ (paramountplus.com)
- Peacock (peacocktv.com)

## Permissions

- **storage** - Save your preferences
- **activeTab** - Apply zoom to the current tab

## License

MIT
