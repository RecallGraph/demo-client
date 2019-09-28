import { Database } from "arangojs";

const db = new Database({
  url: "http://localhost:3000",
  arangoVersion: 30407
});
db.useDatabase("evstore");
db.useBearerAuth(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjEuNTY5Mzk5Mzk4MTM5NzQ1ZSs2LCJleHAiOjE1NzE5OTEzOTgsImlzcyI6ImFyYW5nb2RiIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZXZzdG9yZSJ9.XlPGNQ8Zpn8LP8vI1tNL_KiOVNq5TV6WpuRv6lP3_QY="
);

const evSvc = db.route("evstore");

export const show = (path, timestamp, options) =>
  evSvc.post(
    "event/show",
    { path },
    Object.assign(timestamp ? { timestamp } : {}, options),
    {
      accept: "application/json"
    }
  );
