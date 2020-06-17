const { networkInterfaces } = require('os');

function GetLocalExternalIP() 
{
  return [].concat(...Object.values(networkInterfaces()))
  .filter(details => details.family === 'IPv4' && !details.internal)
  .pop().address;
}

exports.GetLocalExternalIP = GetLocalExternalIP;