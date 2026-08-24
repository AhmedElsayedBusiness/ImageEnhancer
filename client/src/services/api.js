// src/lib/api.js

const BACK = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// — Upload
export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${BACK}/api/images`, {
    method: "POST",
    body: fd
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// — Enhance
// Now expecting a File/Blob in `file`
export async function enhanceImage({ file, technique, parameters }) {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("technique", technique);
  if (parameters) {
    fd.append("parameters", JSON.stringify(parameters));
  }

  const res = await fetch(`${BACK}/api/enhance`, {
    method: "POST",
    body: fd
  });
  if (!res.ok) throw new Error(await res.text());

  // Return raw ArrayBuffer so we can build a Blob on the client
  return await res.arrayBuffer();
}
