/**
 * this is an example of a NodeJS class using this.
 * 
 * It makes more sense in the context in which it was developed;
 *   to work with nwjs in a desktop application. In order to run a
 *   script in a webworker. Could have used fork() but that didn't allow
 *   using compiled binary .bin files.
 */

const assert = require('assert');
const fs = require('fs');

class Dedupe {

    constructor(){
        this.fd = null;
        
        this.fileOffset = 0;

        this.source = Buffer.alloc(4 * 1024 * 1024);

        this.worker = new Worker("bin/worker.js");

        this.worker.onmessage = e=>{
            const data = e.data;
            if ( typeof data.read !== 'undefined' ) {
                this.source = data.source;
                this.read(data.read);
            }else if ( data.complete === true ) {
                // done
                this.source = data.source;
                this.close();
            }else if ( typeof data.hash !== 'undefined' ) {
                if ( typeof this.on_entry === 'function' )
                    this.on_entry(data.hash, data.offset, data.size);
            }else if ( data.ready === true ) {
                this.ready = true;
                if ( this.fd != null )
                    this.read(0);
            }
        };
    }

    exec(file){
        this.fileOffset = 0;

        fs.open(file, 'r', (err, fd)=>{
            if (err) console.log(err);
            this.fd = fd;
            if ( this.ready )
                this.read(0);
        });
    }

    close(error) {
        fs.close(this.fd, ()=>{
            if (error) throw error;
            //assert(this.chunkOffset === this.fileOffset);
            if ( typeof this.on_complete === 'function' )
                this.on_complete();
        });
    }

    read(sourceStart) {
        const length = this.source.length - sourceStart;
        assert(length > 0);
        fs.read(this.fd, this.source, sourceStart, length, this.fileOffset, (err, bytesRead)=>{
            this.fileOffset += bytesRead;
            const flags = (bytesRead < length) ? 1 : 0;
            this.worker.postMessage({size:(sourceStart + bytesRead), flags, source:this.source}, [ this.source.buffer ]);
        });
    }

}

module.exports = Dedupe;