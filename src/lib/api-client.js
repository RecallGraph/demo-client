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
  const blob = await response.blob();
  const data = JSON.parse(await blob.text());

  return cg2cy(data);
};

export const load = async sessionID => {
  const url = new URL(`${document.location.origin}/api/load`);

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(sessionID)
  });
  const blob = await response.blob();
  const data = JSON.parse(await blob.text());

  return cg2cy(data);
};

export const init = async sessionID => {
  const url = new URL(`${document.location.origin}/api/init`);

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(sessionID)
  });
  const blob = await response.blob();
  const data = JSON.parse(await blob.text());

  return data;
};
