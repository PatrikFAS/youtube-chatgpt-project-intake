# v0.1 Manual Acceptance Test

Run these after loading the unpacked extension in Edge or Chrome.

## Must-pass

- [ ] Normal YouTube video with manual English subtitles: tracks appear and transcript loads.
- [ ] Video with auto-generated captions: auto track is labelled and transcript loads.
- [ ] Video with multiple caption languages: selector shows the tracks.
- [ ] Switch between YouTube videos using normal YouTube navigation without restarting the browser: current video metadata is correct.
- [ ] Short video (~5 minutes): transcript and prompt work.
- [ ] Long video (~1 hour): transcript and prompt work.
- [ ] Very large transcript (>100k characters if available): warning appears.
- [ ] No-caption video: clear failure or transcript-panel fallback guidance.
- [ ] View transcript: readable timestamped transcript appears.
- [ ] Copy transcript: clipboard contains title, URL, track, timestamps, and transcript.
- [ ] Apply mode: prompt includes ADOPT / ADAPT / TEST / INVESTIGATE / IGNORE-PARK logic.
- [ ] Analyze mode: prompt asks for critical evaluation rather than project application.
- [ ] Summarize mode: prompt asks for faithful compression rather than broad critique.
- [ ] Optional question: appears in the generated prompt.
- [ ] General ChatGPT destination opens correctly.
- [ ] Saved ChatGPT destination opens correctly.
- [ ] Last destination and mode are remembered.
- [ ] Automatic ChatGPT insertion works on the current ChatGPT UI.
- [ ] If insertion is deliberately broken/blocked, `Ctrl+V` pastes the complete prompt.
- [ ] Extension never presses ChatGPT Send automatically.

## Suggested real-world beta

Use it on at least 20 videos before adding features. Record only actual friction points. Do not add v0.2 features because they merely sound useful.
