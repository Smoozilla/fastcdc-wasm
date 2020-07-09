use wasm_bindgen::prelude::*;
use fastcdc::*;
use sha2::{Sha256, Digest};

extern crate hex;
extern crate js_sys;

#[wasm_bindgen]
pub fn exec(min_size: usize, avg_size: usize, max_size: usize, data: &[u8], source_size: usize, flags: u32, cbobj: &JsValue, callback: &js_sys::Function) -> usize {
    let chunker = FastCDC::new(&data, min_size, avg_size, max_size, source_size, flags);

    let mut bytes_processed: usize = 0;

    for entry in chunker {
        let end = entry.offset + entry.length;
        bytes_processed += entry.length;
        let mut hasher = Sha256::new();
        // write input message
        hasher.input(&data[entry.offset..end]);
        // read hash digest and consume hasher
        let digest = JsValue::from(hex::encode(hasher.result()));
        // convert to javascript values our offset and size
        let offset = JsValue::from(entry.offset as f64);
        let size = JsValue::from(entry.length as f64);
        // execute the provided callback
        let _ = callback.call3(&cbobj, &digest, &offset, &size);
    }

    bytes_processed

}


