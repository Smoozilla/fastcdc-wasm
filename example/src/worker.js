// this file is built for webworker via webpack and then moved into rundir

import assert from 'assert';
import * as wasm from '../fastcdc-wasm/fastcdc_wasm';

const { exec } = wasm_bindgen;

async function Run(){
    await wasm_bindgen("fastcdc_wasm_bg.wasm");

    postMessage({ready:true});
}
Run();

const SIZE_AVG = 65536;
const SIZE_MIN = 16384;
const SIZE_MAX = 524288;

let source;
let chunk_offset = 0;

function write(sourceSize, flags) {
    const sourceOffset = exec(
        SIZE_MIN,
        SIZE_AVG,
        SIZE_MAX,
        source,
        sourceSize,
        flags,
        self,
        (hash, offset, size)=>{
            postMessage({hash,chunk_offset,size});

            chunk_offset += size;
        }
    );

    assert(sourceOffset <= sourceSize);
    assert(sourceOffset <= source.length);

    // Anything remaining in the source buffer should be moved to the
    // beginning of the source buffer, and become the sourceStart for the
    // next read so that we do not read data we have already read:
    let remaining = sourceSize - sourceOffset;
    if (remaining > 0) {
        // Assert that we can copy directly within the source buffer:
        assert(remaining < sourceOffset);
        //source.copy(source, 0, sourceOffset, sourceOffset + remaining);
        let s = 0;
        const total = sourceOffset + remaining;
        for(let i=sourceOffset;i<total;i++){
            source[s++] = source[i];
        }
    }
    if (flags === 1) {
        assert(remaining === 0);
        postMessage({complete:true,source}, [ source.buffer ]);
    } else {
        postMessage({read:remaining,source}, [ source.buffer ]);
    }
}


onmessage = function(event){
    if ( event.data.source ) {
        source = event.data.source;
        chunk_offset = 0;
        write(event.data.size, event.data.flags);
    }
}