/*
 * Copyright 2019 is-land
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const chalk = require('chalk');
const waitOn = require('wait-on');

/* eslint-disable no-console */

exports.checkClientBuildDir = (testMode) => {
  if (!fs.existsSync('./client/build')) {
    console.log(
      chalk.red(
        `Couldn't find the build directory, please run ${chalk.blue(
          'yarn setup',
        )} to build the static files that are needed in the ${testMode.toUpperCase()} test`,
      ),
    );

    return false;
  }

  return true;
};

exports.waitOnService = (url) =>
  new Promise((resolve, reject) => {
    waitOn(
      {
        resources: Array.isArray(url) ? url : [url],
        interval: 2000, // 2 sec
        window: 1000,
        log: true,
      },
      (err) => {
        if (err) {
          console.error('error waiting for url', url);
          console.error(err.message);
          return reject(err);
        }
        resolve(); // success!
      },
    );
  });
