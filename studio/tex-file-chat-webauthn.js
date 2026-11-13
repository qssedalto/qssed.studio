// File-scoped WebAuthn verification. Uses the same ES256, strict UV,
// no-attestation policy as LianChat. Never treats a localStorage flag or a
// client-provided "verified" field as authentication.
const enc = new TextEncoder(), dec = new TextDecoder();
export const b64 = value => {
  let out = "";
  for (const c of new Uint8Array(value)) out += String.fromCharCode(c);
  return btoa(out).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
export function unb64(value) {
  if (typeof value !== "string" || value.length > 12000 || !/^[A-Za-z0-9_-]+$/.test(value)) throw Error("Invalid base64url");
  const raw = atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
export const randomKey = (length = 32) => b64(crypto.getRandomValues(new Uint8Array(length)));
export async function hashText(value) { return b64(await crypto.subtle.digest("SHA-256", enc.encode(value))); }
const bytesEq = (a,b) => a.length === b.length && a.reduce((v,x,i)=>v | (x ^ b[i]),0) === 0;
const equal = (a,b) => typeof a==="string" && typeof b==="string" && a.length === b.length && [...a].reduce((v,c,i)=>v | (c.charCodeAt(0)^b.charCodeAt(i)),0)===0;
const uint32 = (b,n) => b[n]*16777216 + (b[n+1]<<16) + (b[n+2]<<8) + b[n+3];

// Strict, small CBOR decoder for the mandatory WebAuthn "none" attestation,
// rejects indefinite lengths, duplicate map keys, deep nesting and trailing data.
export function decodeCbor(raw) {
  const bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  if (bytes.byteLength > 8192) throw Error("CBOR too large");
  let n = 0;
  function one(depth) {
    if (depth > 12 || n >= bytes.length) throw Error("Invalid CBOR");
    const first=bytes[n++], major=first>>5, small=first&31;
    let len;
    if(small < 24)len=small;
    else if(small===24){if(n>=bytes.length)throw Error("Truncated CBOR");len=bytes[n++];}
    else if(small===25){if(n+2>bytes.length)throw Error("Truncated CBOR");len=(bytes[n++]<<8)|bytes[n++];}
    else if(small===26){if(n+4>bytes.length)throw Error("Truncated CBOR");len=bytes[n++]*16777216+(bytes[n++]<<16)+(bytes[n++]<<8)+bytes[n++];}
    else throw Error("Unsupported CBOR length");
    if(major===0)return len;
    if(major===1)return -len-1;
    if(major===2||major===3){
      if(len > 8192 || n+len>bytes.length)throw Error("Truncated CBOR value");
      const value=bytes.slice(n,n+len);n+=len;
      return major===2?value:dec.decode(value);
    }
    if(major===4){
      if(len>100)throw Error("CBOR array too large");
      return Array.from({length:len},()=>one(depth+1));
    }
    if(major===5){
      if(len>100)throw Error("CBOR map too large");
      const map=new Map();
      for(let i=0;i<len;i++){
        const key=one(depth+1);
        if(map.has(key))throw Error("Duplicate CBOR map key");
        map.set(key,one(depth+1));
      }
      return map;
    }
    if(major===7){
      if(len===20)return false;
      if(len===21)return true;
      if(len===22)return null;
    }
    throw Error("Unsupported CBOR type");
  }
  const result=one(0);
  if(n!==bytes.length)throw Error("Trailing CBOR data");
  return result;
}
function clientData(value,type,challenge,origin){
  const bytes=unb64(value);
  if(bytes.byteLength>3000)throw Error("ClientData too large");
  const item=JSON.parse(dec.decode(bytes));
  if(item.type!==type || !equal(item.challenge,challenge) || item.origin!==origin ||
    item.crossOrigin===true || item.topOrigin)throw Error("WebAuthn challenge or origin mismatch");
  return bytes;
}
async function authData(value,rpId,register){
  const data=typeof value==="string"?unb64(value):value;
  if(!(data instanceof Uint8Array)||data.byteLength<(register?55:37))throw Error("Invalid authenticator data");
  const rpHash=new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(rpId)));
  if(!bytesEq(data.slice(0,32),rpHash))throw Error("Relying party mismatch");
  const flags=data[32];
  // UP + UV are mandatory. A backed-up credential must set BE first.
  if(!(flags&1)||!(flags&4)||((flags&16)&&!(flags&8)))throw Error("Passkey user verification required");
  if(register && !(flags&64))throw Error("Missing attested credential");
  if(!register && (flags&64))throw Error("Assertion includes unexpected credential");
  return {data, flags, counter:uint32(data,33)};
}
function derToRaw(signature){
  if(signature.length===64)return signature;
  let i=0;
  if(signature[i++]!==0x30)throw Error("Invalid ES256 signature");
  let size=signature[i++];
  if(size===0x81)size=signature[i++];
  if(size>100||size!==signature.length-i)throw Error("Invalid ES256 length");
  const part=()=>{
    if(signature[i++]!==2)throw Error("Invalid ES256 integer");
    const length=signature[i++];
    if(length<1||length>33||i+length>signature.length)throw Error("Invalid ES256 integer length");
    let bytes=signature.slice(i,i+length);i+=length;
    while(bytes.length>32 && bytes[0]===0)bytes=bytes.slice(1);
    if(bytes.length>32)throw Error("ES256 out of range");
    const result=new Uint8Array(32);result.set(bytes,32-bytes.length);return result;
  };
  const left=part(),right=part();
  if(i!==signature.length)throw Error("ES256 trailing bytes");
  const output=new Uint8Array(64);output.set(left);output.set(right,32);return output;
}
export async function verifyRegistration(credential,challenge,origin,rpId){
  if(!credential || credential.type!=="public-key" || credential.id!==credential.rawId)throw Error("Invalid credential");
  const credentialId=unb64(credential.rawId);
  if(credentialId.length<16||credentialId.length>1024)throw Error("Invalid credential ID");
  clientData(credential.response?.clientDataJSON,"webauthn.create",challenge,origin);
  const object=decodeCbor(unb64(credential.response?.attestationObject));
  if(!(object instanceof Map)||object.get("fmt")!=="none"||
     !(object.get("attStmt") instanceof Map)||object.get("attStmt").size!==0)throw Error("Only no-attestation passkeys are supported");
  const data=object.get("authData");
  if(!(data instanceof Uint8Array))throw Error("Missing WebAuthn authenticator data");
  const auth=await authData(data,rpId,true);
  const len=(data[53]<<8)|data[54];
  if(len!==credentialId.length||len<16||55+len>=data.length||
     !bytesEq(data.slice(55,55+len),credentialId))throw Error("Attested credential mismatch");
  const cose=decodeCbor(data.slice(55+len));
  if(!(cose instanceof Map)||cose.get(1)!==2||cose.get(3)!==-7||cose.get(-1)!==1)throw Error("Only ES256 P-256 passkeys supported");
  const x=cose.get(-2),y=cose.get(-3);
  if(!(x instanceof Uint8Array)||!(y instanceof Uint8Array)||x.length!==32||y.length!==32)throw Error("Invalid credential public key");
  const jwk={kty:"EC",crv:"P-256",x:b64(x),y:b64(y),ext:true,key_ops:["verify"]};
  await crypto.subtle.importKey("jwk",jwk,{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
  return {id:credential.rawId,x:jwk.x,y:jwk.y,counter:auth.counter,backup:!!(auth.flags&8)};
}
export async function verifyAssertion(credential,challenge,origin,rpId,stored){
  if(!credential || credential.type!=="public-key" ||
     credential.id!==stored.id || credential.rawId!==stored.id)throw Error("Credential does not belong to this room");
  const client=clientData(credential.response?.clientDataJSON,"webauthn.get",challenge,origin);
  const auth=await authData(credential.response?.authenticatorData,rpId,false);
  const hash=new Uint8Array(await crypto.subtle.digest("SHA-256",client));
  const bytes=new Uint8Array(auth.data.length+hash.length);
  bytes.set(auth.data);bytes.set(hash,auth.data.length);
  const key=await crypto.subtle.importKey("jwk",{kty:"EC",crv:"P-256",x:stored.x,y:stored.y,ext:true,key_ops:["verify"]},
    {name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
  const valid=await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},key,derToRaw(unb64(credential.response?.signature)),bytes);
  if(!valid)throw Error("Passkey signature verification failed");
  if(auth.counter>0 && stored.counter>0 && auth.counter<=stored.counter)throw Error("Signature counter replay");
  return {counter:Math.max(auth.counter,stored.counter),backup:!!(auth.flags&8)};
}
