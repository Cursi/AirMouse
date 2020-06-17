// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const utils = require("./utils");

document.getElementById("ipContainer").innerHTML = utils.GetLocalExternalIP();
document.getElementById("portContainer").innerHTML = 1234;
