function cg2cy(data) {
  const typeMap = {
    vertex: "nodes",
    edge: "edges"
  };
  const fieldMap = {
    _id: "id",
    _from: "source",
    _to: "target"
  };

  const result = {};

  for (let el of data) {
    const key = typeMap[el.type];
    result[key] = [];
    for (let node of el.nodes) {
      const item = {};
      for (let k in node) {
        // noinspection JSUnfilteredForInLoop
        item[fieldMap[k] || k] = node[k];
      }
      result[key].push({ data: item });
    }
  }

  return result;
}

function getHeaders(sessionID) {
  return {
    "x-session-id": sessionID,
    "Content-Type": "application/json"
  };
}

export const show = async (sessionID, nids, timestamp, options) => {
  const url = new URL(`${document.location.origin}/api/show`);
  url.search = new URLSearchParams(
    Object.assign(timestamp ? { timestamp } : {}, options)
  );

  const response = await fetch(url, {
    method: "POST",
    body: nids ? JSON.stringify(nids) : undefined,
    headers: getHeaders(sessionID)
  });
  const data = JSON.parse(await response.text());

  return cg2cy(data);
};

export const versions = async (sessionID, nid, ctimes) => {
  const url = new URL(`${document.location.origin}/api/versions`);
  url.search = new URLSearchParams({ nid });

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(ctimes),
    headers: getHeaders(sessionID)
  });

  return JSON.parse(await response.text());
};

export const list = async (sessionID, _rawId) => {
  const url = new URL(`${document.location.origin}/api/list`);
  url.search = new URLSearchParams({ _rawId });

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(sessionID)
  });

  return JSON.parse(await response.text());
};

export const log = async sessionID => {
  const url = new URL(`${document.location.origin}/api/log`);

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(sessionID)
  });

  return JSON.parse(await response.text());
};

export const remove = async (sessionID, nid) => {
  const url = new URL(`${document.location.origin}/api/remove`);
  url.search = new URLSearchParams({ nid });

  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(sessionID)
  });

  return response.text();
};

export const init = async sessionID => {
  const url = new URL(`${document.location.origin}/api/init`);

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(sessionID)
  });

  return response.text();
};

export const addChildren = async (sessionID, parentID, children) => {
  const url = new URL(`${document.location.origin}/api/add`);
  url.search = new URLSearchParams({ parentID });

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(sessionID),
    body: JSON.stringify(children)
  });

  return response.text();
};

export const edit = async (sessionID, node) => {
  const url = new URL(`${document.location.origin}/api/edit`);

  const response = await fetch(url, {
    method: "PUT",
    headers: getHeaders(sessionID),
    body: JSON.stringify(node)
  });

  return response.text();
};
