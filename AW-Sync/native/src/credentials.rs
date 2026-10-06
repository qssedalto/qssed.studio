use std::io;
use windows_sys::Win32::Security::Credentials::{
    CRED_PERSIST_LOCAL_MACHINE, CRED_TYPE_GENERIC, CREDENTIALW, CredDeleteW, CredFree, CredReadW,
    CredWriteW,
};

const TARGET: &str = "AERTEX/WatchSync/DeviceToken";

pub fn save_token(token: &str) -> io::Result<()> {
    let target = wide(TARGET);
    let mut blob = token.as_bytes().to_vec();
    let mut credential: CREDENTIALW = unsafe { std::mem::zeroed() };
    credential.Type = CRED_TYPE_GENERIC;
    credential.TargetName = target.as_ptr() as *mut u16;
    credential.CredentialBlobSize = u32::try_from(blob.len())
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "Device token is too long"))?;
    credential.CredentialBlob = blob.as_mut_ptr();
    credential.Persist = CRED_PERSIST_LOCAL_MACHINE;
    let result = unsafe { CredWriteW(&credential, 0) };
    blob.fill(0);
    if result == 0 {
        Err(io::Error::last_os_error())
    } else {
        Ok(())
    }
}

pub fn load_token() -> io::Result<Option<String>> {
    let target = wide(TARGET);
    let mut pointer = std::ptr::null_mut();
    let result = unsafe { CredReadW(target.as_ptr(), CRED_TYPE_GENERIC, 0, &mut pointer) };
    if result == 0 {
        let error = io::Error::last_os_error();
        if error.raw_os_error() == Some(1168) {
            return Ok(None);
        }
        return Err(error);
    }
    if pointer.is_null() {
        return Ok(None);
    }
    let credential = unsafe { &*pointer };
    let bytes = unsafe {
        std::slice::from_raw_parts(
            credential.CredentialBlob,
            credential.CredentialBlobSize as usize,
        )
    };
    let value = String::from_utf8(bytes.to_vec())
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "Stored device token is invalid"));
    unsafe { CredFree(pointer.cast()) };
    value.map(Some)
}

#[allow(dead_code)]
pub fn delete_token() -> io::Result<()> {
    let target = wide(TARGET);
    let result = unsafe { CredDeleteW(target.as_ptr(), CRED_TYPE_GENERIC, 0) };
    if result == 0 {
        Err(io::Error::last_os_error())
    } else {
        Ok(())
    }
}

fn wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(Some(0)).collect()
}
