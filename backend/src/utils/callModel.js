'use strict';

function callModel(method, ...args) {
  return new Promise((resolve, reject) => {
    method(...args, function (err, result) {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
}

module.exports = callModel;
