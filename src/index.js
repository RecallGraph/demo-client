import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/app/App";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// Store a copy of the fetch function
var _oldFetch = fetch;

// Create our new version of the fetch function
window.fetch = function() {
  // Create hooks
  var fetchStart = new Event("fetchStart", {
    view: document,
    bubbles: true,
    cancelable: false
  });
  var fetchEnd = new Event("fetchEnd", {
    view: document,
    bubbles: true,
    cancelable: false
  });

  // Pass the supplied arguments to the real fetch function
  var fetchCall = _oldFetch.apply(this, arguments);

  // Trigger the fetchStart event
  document.dispatchEvent(fetchStart);

  fetchCall
    .then(function() {
      // Trigger the fetchEnd event
      document.dispatchEvent(fetchEnd);
    })
    .catch(function() {
      // Trigger the fetchEnd event
      document.dispatchEvent(fetchEnd);
    });

  return fetchCall;
};

document.addEventListener("fetchStart", function() {
  const spinner = document.getElementById("loading");
  spinner.classList.remove("invisible");
  spinner.classList.add("visible");
});

document.addEventListener("fetchEnd", function() {
  const spinner = document.getElementById("loading");
  spinner.classList.remove("visible");
  spinner.classList.add("invisible");
});
