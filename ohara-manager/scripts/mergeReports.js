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

const path = require('path');
const { isEmpty } = require('lodash');
const { readdirSync, unlinkSync, existsSync } = require('fs');
const { mergeFiles } = require('junit-report-merger');

const { logger } = require('../utils/commonUtils');

// Cypress team is considering to support generating single test
// report in a test run. But the issue is still pending, so we're
// manually merging test reports here. See the below issue for
// more info: https://github.com/cypress-io/cypress/issues/1946

const getFiles = () => {
  const files = readdirSync('./test-reports');
  return files
    .filter((file) => file.includes('Report-'))
    .map((file) => path.resolve(`./test-reports/${file}`)); // we need the full path!
};

const deleteFiles = (files) => {
  files.forEach((file) => unlinkSync(file));
};

const merge = ({ reportDistPath, filesToBeMerged, reject, resolve }) => {
  mergeFiles(reportDistPath, filesToBeMerged, (err) => {
    if (err) reject(err);
    deleteFiles(filesToBeMerged); // Delete reports that were just merged

    logger.success(
      `Merged all test reports!\nYou can view report at ${reportDistPath}`,
    );

    resolve();
  });
};

const mergeReports = (fileName) =>
  // Return a promise here so we can await it later
  new Promise((resolve, reject) => {
    const files = getFiles();
    const reportDistPath = path.resolve(`./test-reports/${fileName}.xml`);
    const mergeParams = {
      reportDistPath: reportDistPath,
      filesToBeMerged: files,
      reject,
      resolve,
    };

    if (isEmpty(files)) {
      logger.error(`No report found in ${reportDistPath}!`);
      reject();
    }

    if (existsSync(reportDistPath)) {
      unlinkSync(reportDistPath);
      merge(mergeParams);
    } else {
      merge(mergeParams);
    }
  });

module.exports = mergeReports;
