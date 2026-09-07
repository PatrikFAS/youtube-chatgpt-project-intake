# Implementation note

This extension is an independent implementation created for Patrik's workflow.

Its architecture uses standard Chromium extension patterns and was informed by public, open-source YouTube transcript projects. In particular, the v0.1.1 fallback strategy was informed by the MIT-licensed `mbogdan0/youtube-transcript` project, which documents current YouTube behavior where some timedtext requests require a Proof-of-Origin (`pot`) token, plus a transcript-panel DOM fallback.

No third-party source files or libraries are bundled in this package. The implementation remains dependency-free.
