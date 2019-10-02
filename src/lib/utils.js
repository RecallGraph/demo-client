function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const generateSessionID = () => {
  const sessionID = uuidv4();
  window.localStorage.setItem("sessionID", sessionID);

  return sessionID;
};

export const escapeHtml = unsafe => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const getObjClass = data => {
  return data["obj-class"]
    .substr(0, data["obj-class"].length - 1)
    .replace(/_/g, " ")
    .toProperCase();
};
