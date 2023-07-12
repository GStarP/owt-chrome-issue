# OWT Chrome Issue

This minium reproduce demo is based on [owt-client-javascript](https://github.com/open-webrtc-toolkit/owt-client-javascript) conference sample, mainly changed in `index.js`. The other changes is marked with comment `@CHANGE`.

## Environment

owt-server: [5.0 release](https://github.com/open-webrtc-toolkit/owt-server/commit/86930c3be6590aefa8452c78749e2e72ed5b379b)

owt-client-javascript: built with [5.0.x source](https://github.com/open-webrtc-toolkit/owt-client-javascript/commit/17acc767cc610064da8f05a4bf1ac427b4bb6f22)

Chrome: 114.0.5735.199 (64 bit)

Windows: 10 (19044.3086)

## Reproduce

> You can just open `index.html` by VSCode's `open in default browser` plugin

Process:
1. subscribe mixed stream "common" and play.
2. publish mic audio, mix it into "common".
3. publish screen video, mix it into "common".

Expect: video plays smoothly.

Actual: video begins to lag after about 3s.

## Experiment

I notice that my system works well in Electron.js, so I guess whether this problem comes from chromium version.

I tests this demo in old version (103.0.5049.0) Chrome downloaded from [here](https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win_x64/1000704/), and this problem disappears.

I hope someone can prove that this issue is a common problem and I also look forward to the root cause and permanent solution.