function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const annotate = data => {
  data.nodes.forEach(
    node =>
      (node.data["obj-class"] = node.data.id.match(/evstore_test_(.*)\/.*/)[1])
  );

  return data;
};

export const buildSwitchBoard = dataNode => {
  const childClasses = dataNode
    .outgoers()
    .filter(el => el.isNode())
    .reduce((acc, node) => {
      acc.add(node.data()["obj-class"]);

      return acc;
    }, new Set());

  const switchboard = {};
  for (const objClass of childClasses) {
    switchboard[objClass] = false;
  }
  dataNode.scratch("switchboard", switchboard);
};

export const generateSessionID = () => {
  const sessionID = uuidv4();
  window.localStorage.setItem("sessionID", sessionID);

  return sessionID;
};
