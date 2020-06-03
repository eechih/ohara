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

import { assign } from 'xstate';

export const next = assign({ activeIndex: context => context.activeIndex + 1 });

export const prev = assign({ activeIndex: context => context.activeIndex - 1 });

export const callApiSuccess = assign(ctx => {
  const { activeIndex, activities, forward } = ctx;
  const rollback = !forward;

  if (forward && activeIndex < activities.length) {
    ctx.activeIndex = activeIndex + 1;
  }

  if (rollback && activeIndex > -1) {
    ctx.activeIndex = activeIndex - 1;
  }
});

export const callApiFailure = assign((ctx, evt) => {
  ctx.error = evt;
});
