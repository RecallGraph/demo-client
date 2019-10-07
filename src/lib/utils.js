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

export const getObjClass = data => {
  return data["obj-class"]
    .substr(0, data["obj-class"].length - 1)
    .replace(/_/g, " ")
    .toProperCase();
};

export const getTableProps = el => {
  const data = Object.assign({}, el.data());
  delete data.id;
  delete data._rawId;

  const objClass = getObjClass(data);
  delete data["obj-class"];

  const body = data.Body;
  delete data.Body;

  const content = Object.entries(data).map(entry => ({
    field: entry[0],
    value: entry[1]
  }));

  return { objClass, body, content };
};

export const removePopper = (popperKey, divKey) => {
  const popper = window.poppers[popperKey];
  if (popper) {
    if (popper.reference.removeAttribute) {
      popper.reference.removeAttribute("disabled");
    }
    popper.destroy();
    delete window.poppers[popperKey];
  }

  const el = document.getElementById(divKey);
  if (el) {
    el.remove();
  }
};

export const setPopper = (id, popper) => {
  window.poppers = window.poppers || {};
  window.poppers[id] = popper;
};
