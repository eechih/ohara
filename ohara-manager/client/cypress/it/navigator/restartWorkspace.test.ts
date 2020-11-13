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

import * as generate from '../../../src/utils/generate';
import { SettingSection } from '../../types';
import { hashByGroupAndName } from '../../../src/utils/sha';
import { NodeRequest } from '../../../src/api/apiInterface/nodeInterface';
import { RESOURCE } from '../../../src/api/utils/apiUtils';

// Create two fake nodes
const node: NodeRequest = generate.node();

const logs = {
  zookeeper: [
    'Stop worker',
    'update worker',
    'Stop topic',
    'Stop broker',
    'update broker',
    'Stop zookeeper',
    'update zookeeper',
    'Start zookeeper',
    'Start broker',
    'Start topic',
    'Start worker',
    'Restart workspace',
  ],
  broker: [
    'Stop worker',
    'update worker',
    'Stop topic',
    'Stop broker',
    'update broker',
    'Start broker',
    'Start topic',
    'Start worker',
    'Restart workspace',
  ],
  worker: ['Stop worker', 'update worker', 'Start worker', 'Restart workspace'],
};

const retrySpecs = [
  {
    resourceType: RESOURCE.BROKER,
    group: 'broker',
  },
  {
    resourceType: RESOURCE.WORKER,
    group: 'worker',
  },
];

describe('Restart workspace', () => {
  before(() => {
    cy.deleteServicesByApi();
    cy.createWorkspaceByApi();
  });

  beforeEach(() => {
    // our tests should begin from home page
    cy.visit('/');
    cy.server();
  });

  it('should be able to add node into workspace', () => {
    // Create a new node
    cy.createNode(node);

    // Add node into workspace
    cy.switchSettingSection(SettingSection.nodes);
    cy.get('.section-page-content').within(() => {
      cy.findByTitle('Add node').click();
    });

    cy.findVisibleDialog().within(() => {
      cy.get('#mui-component-select-nodeName').click();
    });

    cy.get('#menu-nodeName')
      .should('be.visible')
      .findByText(node.hostname)
      .click();

    cy.findVisibleDialog().findByText('ADD').click();

    cy.get('.section-page-content').within(() => {
      cy.findByText(node.hostname)
        .should('exist')
        .siblings('td')
        .eq(2) // The "Used" column
        .invoke('html')
        .should('be.empty'); // There is no service assigned to this node yet
    });
  });

  it('should be able to restart worker by click restart button', () => {
    cy.switchSettingSection(SettingSection.dangerZone, 'Restart this worker');

    cy.findVisibleDialog().findByText('RESTART').click();

    // Expected these logs to be shown in the dialog
    logs.worker.forEach((log) => {
      cy.findByText(log, { exact: false }).should('exist');
    });

    cy.findByText('CLOSE').parent('button').should('be.enabled').click();
  });

  it('should be able to restart workspace by click restart button', () => {
    cy.switchSettingSection(
      SettingSection.dangerZone,
      'Restart this workspace',
    );

    cy.findVisibleDialog().findByText('RESTART').click();

    // Expected these logs to be shown in the dialog
    logs.zookeeper.forEach((log) => {
      cy.findByText(log, { exact: false }).should('exist');
    });

    cy.findByText('CLOSE').parent('button').should('be.enabled').click();
  });

  // Create multiple tests. Note that we need to wrap the `it(...)` in the loop so the
  // cy.server() can work properly
  retrySpecs.forEach((spec) => {
    const { resourceType, group } = spec;
    it(`should able to retry fail update request when restarting with ${group}`, () => {
      cy.switchSettingSection(
        SettingSection.dangerZone,
        'Restart this workspace',
      );

      cy.route({
        method: 'PUT',
        url: `api/${resourceType}/workspace1?group=${group}`,
        status: 403,
        response: {},
      });

      cy.findVisibleDialog().findByText('RESTART').click();

      cy.findByText('ERROR', { exact: false });

      // Reset stab routes
      cy.server({ enable: false });

      cy.findVisibleDialog().findByText('RETRY').click();

      cy.findByTestId('snackbar').should(
        'have.text',
        'Successfully restarted workspace workspace1.',
      );

      cy.findByText('100%');

      cy.findByText('CLOSE').parent('button').should('be.enabled').click();
    });
    it(`should able to retry fail start request when restarting with ${group}`, () => {
      cy.switchSettingSection(
        SettingSection.dangerZone,
        'Restart this workspace',
      );

      cy.route({
        method: 'PUT',
        url: `api/${resourceType}/*/start**`,
        status: 403,
        response: {},
      });

      cy.findVisibleDialog().findByText('RESTART').click();

      cy.findByText('ERROR', { exact: false });

      cy.request('PUT', `api/${resourceType}/workspace1/start?group=${group}`);

      // Reset stab routes
      cy.server({ enable: false });

      cy.findVisibleDialog().findByText('RETRY').click();

      cy.findByTestId('snackbar').should(
        'have.text',
        'Successfully restarted workspace workspace1.',
      );

      cy.findByText('100%');

      cy.findByText('CLOSE').parent('button').should('be.enabled').click();
    });

    it(`should able to retry fail stop request when restarting with ${group}`, () => {
      cy.switchSettingSection(
        SettingSection.dangerZone,
        'Restart this workspace',
      );

      cy.route({
        method: 'PUT',
        url: `api/${resourceType}/*/stop**`,
        status: 403,
        response: {},
      });

      cy.findVisibleDialog().findByText('RESTART').click();

      cy.findByText('ERROR', { exact: false });

      cy.request('PUT', `api/${resourceType}/workspace1/stop?group=${group}`);

      // Reset stab routes
      cy.server({ enable: false });

      cy.findVisibleDialog().findByText('RETRY').click();

      cy.findByTestId('snackbar').should(
        'have.text',
        'Successfully restarted workspace workspace1.',
      );

      cy.findByText('100%');

      cy.findByText('CLOSE').parent('button').should('be.enabled').click();
    });
  });

  it('should able to retry fail start request when restarting with topics', () => {
    cy.switchSettingSection(
      SettingSection.dangerZone,
      'Restart this workspace',
    );

    const group = hashByGroupAndName('workspace', 'workspace1');

    cy.route({
      method: 'GET',
      url: `api/topics?group=${group}`,

      status: 200,
      response: [
        { name: 't1', group },
        { name: 't2', group },
      ],
    });

    cy.route({
      method: 'PUT',
      url: 'api/topics/*/stop**',
      status: 202,
      response: {},
    });

    cy.route({
      method: 'GET',
      url: `api/topics/t1?group=${group}`,
      status: 200,
      response: {},
    });

    cy.route({
      method: 'GET',
      url: `api/topics/t2?group=${group}`,
      status: 200,
      response: {},
    });

    cy.findVisibleDialog().findByText('RESTART').click();

    cy.findByText('ERROR', { exact: false });

    // Reset stab routes
    cy.server({ enable: false });

    cy.findVisibleDialog().findByText('RETRY').click();

    cy.findByTestId('snackbar').should(
      'have.text',
      'Successfully restarted workspace workspace1.',
    );

    cy.findByText('100%');

    cy.findByText('CLOSE').parent('button').should('be.enabled').click();
  });

  it('should able to retry fail stop request when restarting with topics', () => {
    cy.switchSettingSection(
      SettingSection.dangerZone,
      'Restart this workspace',
    );

    const group = hashByGroupAndName('workspace', 'workspace1');

    cy.route({
      method: 'GET',
      url: `api/topics?group=${group}`,
      status: 200,
      response: [
        { name: 't1', group },
        { name: 't2', group },
      ],
    });

    cy.findVisibleDialog().findByText('RESTART').click();

    cy.findByText('ERROR', { exact: false });

    // Reset stab routes
    cy.server({ enable: false });

    cy.findVisibleDialog().findByText('RETRY').click();

    cy.findByTestId('snackbar').should(
      'have.text',
      'Successfully restarted workspace workspace1.',
    );

    cy.findByText('100%');

    cy.findByText('CLOSE').parent('button').should('be.enabled').click();
  });

  it('should rollback a workspace to its original state', () => {
    cy.switchSettingSection(
      SettingSection.dangerZone,
      'Restart this workspace',
    );

    cy.route({
      method: 'PUT',
      url: 'api/workers/*/start**',
      status: 403,
      response: {},
    });

    cy.findVisibleDialog().findByText('RESTART').click();

    cy.findByText('ERROR', { exact: false });

    cy.findVisibleDialog().findByText('ROLLBACK').click();

    // Reset stab routes
    cy.server({ enable: false });

    cy.findByText('15%');

    cy.request('PUT', 'api/workers/workspace1/start?group=worker');

    cy.findByText('0%');
    cy.findByText('CLOSE').parent('button').should('be.enabled').click();
  });

  it('should mark the workspace as unstable when it fails during the creation', () => {
    cy.switchSettingSection(
      SettingSection.dangerZone,
      'Restart this workspace',
    );

    cy.route({
      method: 'PUT',
      url: 'api/workers/workspace1?group=worker',
      status: 403,
      response: {},
    });

    cy.findVisibleDialog().findByText('RESTART').click();

    cy.findByText('ERROR', { exact: false }).should('have.length', 1);

    cy.findByText('CLOSE').parent('button').should('be.enabled').click();

    cy.findByText('ABORT').parent('button').click();

    // close the snackbar
    cy.findByTestId('snackbar').find('button:visible').click();

    // close the settings dialog
    cy.findByTestId('workspace-settings-dialog-close-button')
      .should('be.visible')
      .click();

    cy.get('span[title="Unstable workspace"]').should('have.length', 1);
  });
});
