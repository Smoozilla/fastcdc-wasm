Multithreaded streamable FastCDC that works in browser via WebWorker.

This was pulled out the client side of a project when deemed no longer necessary. Would be a waste to just throw this away. That being said, this project isn't tested and is still a little ways from a full working example. It was working well when pulled from project.

Why? The point of this was to use FastCDC inside of a desktop application running on NWJS.io, but could also be used inside a browser application since it's WASM.


To build;
- install cargo and webpack wasm.
- build.bat
- copy files from pkg/ to example/fastcdc-wasm
- cd example/
- npm install
- npm run build

inside of example/bin you will find worker.js and fastcdc_wasm_bg.wasm. worker.js is ready to be ran from a WebWorker and using postMessage to communicate.

Forgive the lack of effort in this README, I have no intention to maintain this project past archiving it, but things change.