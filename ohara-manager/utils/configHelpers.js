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

const yargs = require('yargs');
const chalk = require('chalk');
const { isNumber } = require('lodash');
const net = require('net');
const URL = require('url').URL;

const { logger } = require('./commonUtils');
const utils = require('./commonUtils');

/* eslint-disable no-process-exit */
const validateUrl = async (url) => {
  const regex = /https?:\/\/[-a-z0-9._+~#=:]{2,256}\/v[0-9]/gi;
  const validUrl = chalk.bold.green('http://localhost:5050/v0');

  if (!regex.test(url)) {
    logger.log();
    logger.log(
      `--configurator: ${chalk.bold.red(
        url,
      )} is invalid\n\nThe valid configurator URL should be something like: ${validUrl}`,
    );
    logger.log();

    // Throw an error here won't stop the node process
    // since we're inside an async function, that's a promise rejection
    process.exit(1);
  }

  // Ensure the API URL can be reached
  // Retry on failure
  const checkConfiguratorReady = () => {
    const { hostname, port } = new URL(url);

    return new Promise((resolve) => {
      const socket = new net.Socket();
      const onError = (err) => {
        logger.error(err.message);
        socket.destroy();
        resolve(false);
      };
      socket.setTimeout(10000);
      socket.once('error', (err) => onError(err));
      socket.once('timeout', (err) => onError(err));

      socket.connect(parseInt(port), hostname, () => {
        socket.end();
        resolve(true);
      });
    }).catch((error) => {
      logger.error(error.message);
    });
  };

  const printSuccessMsg = () =>
    logger.success(
      `Successfully connected to the configurator: ${chalk.bold.underline(
        url,
      )}`,
    );

  const printFailMsg = () => {
    logger.warn(
      `Couldn't connect to the configurator url you provided: ${chalk.bold(
        url,
      )}, retrying...`,
    );
  };

  let count = 0;
  let isReady = false;
  while (!isReady && count <= 10) {
    // The total waiting time : 10 (count) * 3000 (sleep) = 30000 ms = 30 seconds,
    // the actual time should be more since we have a 10 seconds timeout setting
    // in socket
    isReady = await checkConfiguratorReady();
    if (!isReady) printFailMsg();
    count++;
    await utils.sleep(3000); // wait for 3 sec and make another request
  }
  if (!isReady) {
    logger.log();
    logger.log(
      `--configurator: we're not able to connect to ${chalk.bold.red(
        url,
      )}\n\nPlease make sure your Configurator is running at ${chalk.bold.green(
        url,
      )}`,
    );
    logger.log();
    process.exit(1);
  }
  printSuccessMsg();
};

const validatePort = (port) => {
  const isValidPort = port >= 0 && port <= 65535;

  if (!isNumber(port)) {
    logger.log();
    logger.log(`--port: ${chalk.red(port)} is not a number`);
    logger.log();
    process.exit(1);
  }

  if (!isValidPort) {
    logger.log();
    logger.log(
      `--port: ${chalk.red(
        port,
      )} is invalid\n\nValid port number is between the range of ${chalk.green(
        0,
      )} and ${chalk.green(65535)}`,
    );
    logger.log();
    process.exit(1);
  }
};

const getConfig = () => {
  // Don't run yargs when running tests with jest
  // Doing so will cause jest hanging in the watch mode
  if (process.env.NODE_ENV !== 'test') {
    return yargs
      .options({
        configurator: {
          demandOption: true,
          describe: 'Ohara configurator api',
          string: true,
          alias: 'c',
        },
        port: {
          describe: 'Ohara manager port, defaults to 5050',
          default: 5050,
          alias: 'p',
        },
      })
      .help()
      .alias('help', 'h')
      .version(false) // Disable version info, see https://github.com/oharastream/ohara/issues/1892
      .check((argv) => {
        const { configurator, port } = argv;
        validateUrl(configurator);
        validatePort(port);
        return true;
      }).argv;
  }
};

module.exports = {
  validateUrl,
  validatePort,
  getConfig,
};
