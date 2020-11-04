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

const restartSpecs = [
  {
    section: SettingSection.zookeeper,
    sectionItem: `${SettingSection.zookeeper} nodes`,
    logs: logs.zookeeper,
  },
  {
    section: SettingSection.broker,
    sectionItem: `${SettingSection.broker} nodes`,
    logs: logs.broker,
  },
  {
    section: SettingSection.worker,
    sectionItem: `${SettingSection.worker} nodes`,
    logs: logs.worker,
  },
];

const retrySpecs = [
  {
    resourceType: RESOURCE.ZOOKEEPER,
    group: 'zookeeper',
  },
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
      cy.findByTitle('Add Node').click();
    });

    cy.findVisibleDialog().within(() => {
      cy.get('table')
        .should('have.length', 1)
        .within(($table) => {
          // Check the node info and select it
          cy.getTableCellByColumn($table, 'Hostname', node.hostname)
            .should('exist')
            .siblings('td')
            .first()
            .find('input[type="checkbox"]')
            .click();
        });

      cy.findByText('SAVE').click();
    });

    cy.get('.section-page-content').within(() => {
      cy.findByText(node.hostname)
        .should('exist')
        .siblings('td')
        .eq(3) // The "Used" column
        .invoke('html')
        .should('be.empty'); // There is no service assigned to this node yet
    });
  });

  it('should show a restart notification after adding a new node to zookeeper', () => {
    cy.switchSettingSection(SettingSection.zookeeper, 'Zookeeper nodes');

    cy.get('.section-page-content').within(() => {
      cy.findByTitle('Add Node').click();
    });

    cy.findVisibleDialog().within(() => {
      cy.get('table')
        .should('have.length', 1)
        .within(($table) => {
          // assert the Services should be 0
          cy.getTableCellByColumn($table, 'Services', '0').should('exist');

          // Check node hostname
          cy.getTableCellByColumn($table, 'Name', node.hostname)
            .should('exist')
            .siblings('td')
            .first()
            .find('input[type="checkbox"]')
            .click();
        });

      cy.findByText('SAVE').click();
    });

    cy.get('.section-page-content').within(() => {
      // Undo added node
      cy.findByText(node.hostname)
        .siblings('td')
        .last()
        .within(() => {
          cy.findByTitle('Undo add node').click();
        });
      cy.findByText(node.hostname).should('not.exist');
    });

    // Adding node again
    cy.get('.section-page-content').within(() => {
      cy.findByTitle('Add Node').click();
    });

    cy.findVisibleDialog().within(() => {
      cy.get('table')
        .should('have.length', 1)
        .within(($table) => {
          // Assert the Services should be 0
          cy.getTableCellByColumn($table, 'Services', '0').should('exist');

          // Check node hostname
          cy.getTableCellByColumn($table, 'Name', node.hostname)
            .should('exist')
            .siblings('td')
            .first()
            .find('input[type="checkbox"]')
            .click();
        });

      cy.findByText('SAVE').click();
    });

    // Back to Settings dialog
    cy.get('.section-page-header').within(() => {
      cy.get('button').click();
    });

    // The zookeeper section should have 1 change notification
    cy.contains('h2', SettingSection.zookeeper)
      .parent('section')
      .find('ul')
      .as('list')
      .contains('span', '1');

    // click the discard button in indicator again
    cy.findAllByRole('alert')
      .scrollIntoView()
      .should('have.length', 1)
      .within(() => {
        cy.contains('button', 'DISCARD').click();
      });

    cy.findVisibleDialog().findByText('DISCARD').click();

    // the zookeeper section should not have any change notifications or indicators now
    cy.findAllByRole('alert').should('not.exist');
    cy.get('@list').contains('span', '1').should('not.exist');
  });

  it('should be able to restart from indicator after adding node to each service', () => {
    restartSpecs.forEach((spec) => {
      const { section, sectionItem, logs } = spec;

      cy.switchSettingSection(section, sectionItem);
      cy.get('.section-page-content').within(() => {
        cy.findByTitle('Add Node').click();
      });

      cy.findVisibleDialog().within(() => {
        cy.get('table')
          .should('have.length', 1)
          .within(($table) => {
            // Select the newly added hostname
            cy.getTableCellByColumn($table, 'Name', node.hostname)
              .should('exist')
              .siblings('td')
              .first()
              .find('input[type="checkbox"]')
              .click();
          });

        cy.findByText('SAVE').click();
      });

      // Back to Settings dialog
      cy.get('.section-page-header').within(() => {
        cy.get('button').click();
      });

      // Restart by clicking on the restart indicator
      cy.findAllByRole('alert')
        .scrollIntoView()
        .should('have.length', 1)
        .within(() => {
          cy.contains('button', 'RESTART').click();
        });

      // Confirm the "restart" changes
      cy.findVisibleDialog().contains('button', 'RESTART').click();

      cy.findVisibleDialog().within(() => {
        // Assert the log
        logs.forEach((log) => {
          cy.findByText(log, { exact: false }).should('exist');
        });

        cy.findByText('CLOSE').parent('button').should('be.enabled').click();
      });

      // close the snackbar
      cy.findByTestId('snackbar').find('button:visible').click();

      // close the settings dialog
      cy.findByTestId('workspace-settings-dialog-close-button')
        .should('be.visible')
        .click();

      cy.switchSettingSection(section, sectionItem);
      cy.get('.section-page-content').within(() => {
        cy.get('table')
          .should('have.length', 1)
          .within(($table) => {
            // assert the Services should be 1 now
            cy.getTableCellByColumn($table, 'Services', '1').should('exist');
          });
      });
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
