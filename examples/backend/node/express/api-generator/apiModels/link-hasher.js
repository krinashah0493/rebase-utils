'use-strict';

module.exports = {
  initEncoderSchema,
  encodeDynamicHash,
  decodeDynamicHash,
}


// @EDE: TODO: Adapt based on this implementation for hashed link generation, this is provided as an example.
const characters = "0123456789abcdef";   // Only use hex chars since the id only contains hex chars

// Generate the Encoder Schema for 16 Random Chars and 16 Valid Chars
let encoderSchema;
function initEncoderSchema() {
  encoderSchema = new Array(255);
  let r = 0;
  let v = 0;
  for (let i = 0; i < 255; i++) {
    encoderSchema[i] = new Array(4);
    encoderSchema[i][0] = r;
    encoderSchema[i][1] = v;
    encoderSchema[i][2] = 20 - r;
    encoderSchema[i][3] = 12 - v;
    r++;
    if (r > 20) {
      r = 0;
      v++;
    }
  }
}


function encodeDynamicHash(transactionId) {
  console.log('Input Transaction Id', transactionId)
  const encodeFormat = parseInt(Math.floor(Math.random() * 254));
  let dynamicHash = "";

  // First 2 Random Chars
  dynamicHash += characters.charAt(Math.floor(Math.random() * characters.length));
  dynamicHash += characters.charAt(Math.floor(Math.random() * characters.length));

  if (encodeFormat <= 0xF) {
    dynamicHash += "0";
  }

  // Hex Chars for the Format Field
  dynamicHash += encodeFormat.toString(16);

  // Append Random Chars
  for (let i = 0; i < encoderSchema[encodeFormat][0]; i++) {
    dynamicHash += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Append Valid Chars
  for (let i = 0; i < encoderSchema[encodeFormat][1] * 2; i++) {
    dynamicHash += transactionId[i];
  }

  // Append Random Chars
  for (let i = 0; i < encoderSchema[encodeFormat][2]; i++) {
    dynamicHash += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Append Valid Chars
  for (let i = 0; i < encoderSchema[encodeFormat][3] * 2; i++) {
    dynamicHash += transactionId[i + (encoderSchema[encodeFormat][1] * 2)];
  }

  console.log('Output', dynamicHash);
  return dynamicHash;
}


function decodeDynamicHash(dynamicHash) {
  let encoderFormat = 0xFF;
  let decodedId = "";
  if (dynamicHash.length == 48) {
    // Find the Format
    encoderFormat = (parseInt(dynamicHash[2], 16) << 4) & 0xF0;
    encoderFormat |= (parseInt(dynamicHash[3], 16) & 0x0F);

    let offset = 0;

    // Append Valid Chars from A section
    offset = 4 + encoderSchema[encoderFormat][0];
    for (let i = 0; i < encoderSchema[encoderFormat][1] * 2; i++) {
      decodedId += dynamicHash[i + offset];
    }

    // Append Valid Chars from B section
    offset = 4 + encoderSchema[encoderFormat][0] + (encoderSchema[encoderFormat][1] * 2) + encoderSchema[encoderFormat][2];
    for (let i = 0; i < encoderSchema[encoderFormat][3] * 2; i++) {
      decodedId += dynamicHash[i + offset];
    }
  }
  return decodedId;
}