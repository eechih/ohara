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

const cp = require('child_process');

const { logger } = require('../utils/commonUtils');

// Kill both server and client processes
try {
  if (process.platform === 'win32') {
    cp.execSync('node_modules\\.bin\\forever stopall', { stdio: 'inherit' });
  } else {
    cp.execSync('./node_modules/.bin/forever stopall', { stdio: 'inherit' });
  }
} catch (error) {
  throw new Error(error);
}

try {
  if (process.platform === 'win32') {
    logger.warn('Windows cannot delete tasklist due to security issue!');
  } else {
    cp.execSync('pkill -f start.js', { stdio: 'inherit' });
  }
} catch (error) {
  if (error.status === 1) {
    // Couldn't find any processes, exit with success status
    /* eslint-disable no-process-exit */
    process.exit(0);
    /* eslint-enable no-process-exit */
  }

  // Real error, throw it out
  throw new Error(error);
}
