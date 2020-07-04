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
import { NodeRequest } from '../../../src/api/apiInterface/nodeInterface';
import { GROUP } from '../../../src/const';
import { generateNodeIfNeed } from '../../utils';

describe('App Bar', () => {
  before(() => cy.deleteAllServices());

  beforeEach(() => {
    // our tests should begin from home page
    cy.visit('/');
  });

  // generate workspace name
  const name = generate.serviceName({ prefix: 'a', length: 10 });
  // generate fake node
  const node: NodeRequest = {
    hostname: generate.serviceName(),
    port: generate.port(),
    user: generate.userName(),
    password: generate.password(),
  };

  // Although context is identical to describe (https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Test-Structure)
  // We use context here to make a "second layer" to organize tests as
  // ${describe}.${context}
  context('When page is initially opened', () => {
    it('should popup an intro dialog', () => {
      // find all the visible dialogs
      // and assert it should have only one element
      cy.findAllByRole('dialog')
        .filter(':visible')
        .should('have.length', 1)
        // the intro dialog should have "quick create" button
        .contains('button', 'QUICK CREATE');

      // the close button should have a test-id on it
      cy.findByTestId('close-intro-button');

      // the url should be in root path
      cy.location().should((location) => {
        expect(location.pathname).to.be.eq('/');
      });
    });

    it('should have a clean app bar after close intro dialog', () => {
      cy.findByTestId('close-intro-button').click();

      // there should have only 1 element of workspace list link which is "create workspace button"
      cy.get('#app-bar')
        .find('div.workspace-list span')
        .should('have.length', 1);

      // we have four tools in app bar (workspace list, event log, dev tool, and node list)
      cy.get('div.tools button').should('have.length', 4);

      // click workspace list button will show intro button
      cy.findByTitle(/workspace list/i).click();
      cy.findAllByRole('dialog').filter(':visible').should('have.length', 1);
      cy.findByTestId('close-intro-button').click();

      // event logs should be empty
      cy.findByTitle(/event logs/i).click();
      cy.findByTestId('event-log-list').within(() => {
        // the container of all log messages
        cy.findByRole('grid').should('be.empty');
      });

      // developer tool should be empty
      cy.findByTitle(/developer tools/i).click();
      cy.findByRole('tablist')
        .filter(':visible')
        .should('have.length', 1)
        .find('button')
        // we only have two tabs (TOPICS and LOGS)
        .should('have.length', 2);
      cy.findByTestId('topic-list-select').click();
      cy.get('ul[role="listbox"]').should('not.exist');

      // node list should be empty
      cy.findByTitle(/node list/i).click();
      cy.get('table:visible')
        .should('have.length', 1)
        .find('tbody tr')
        .should('have.length', 1)
        .contains('td', /no records to display/i);
      cy.findByTestId('nodes-dialog-close-button').click();
    });
  });

  context('Add workspaces', () => {
    it('should have added two workspaces in list', () => {
      // create workspace with default name "workspace1"
      cy.createWorkspace({ node });

      // there should have 2 element of workspace list link (workspace1 and new-add-button)
      cy.get('#app-bar')
        .find('div.workspace-list span')
        .should('have.length', 2)
        .first()
        .contains('a', 'WO')
        .click();
      cy.location('pathname').should('equal', '/workspace1');

      // there should have only one event log
      cy.findByTitle('Event logs').click();
      cy.findByTestId('event-log-list').within(() => {
        cy.findAllByText('Successfully created workspace workspace1.').should(
          'exist',
        );
      });
      // change the settings to unlimited
      cy.findByTitle('Event logs settings').click();
      cy.get('input[type="checkbox"]:visible').check();
      cy.findAllByText('SAVE').filter(':visible').click();
      cy.findByText('There is only 1 currently').should('exist');

      // create workspace with random name
      cy.createWorkspace({ workspaceName: name, node });

      // there should have 3 element of workspace list link now
      cy.get('#app-bar')
        .find('div.workspace-list span')
        .should('have.length', 3)
        .first()
        .contains('a', name.substring(0, 2).toUpperCase());
      cy.location('pathname').should('equal', `/${name}`);

      // switch workspace from quick icon to default one
      cy.get('#app-bar')
        .find('div.workspace-list span')
        .contains('a', 'WO')
        .click();
      // should switch to workspace1
      cy.location('pathname').should('equal', '/workspace1');

      // click workspace list button will show all workspaces
      cy.findByTitle(/workspace list/i).click();
      // the workspace list dialog
      cy.findAllByRole('dialog')
        .filter(':visible')
        .should('have.length', 1)
        .contains('div', /showing 2 workspaces/i);
      // we should in one of the workspaces and it should not be able to click
      cy.findByTitle(`This is the workspace that you're at now`)
        .find('button')
        .should('be.disabled');

      // switch workspace from workspace list to another workspace
      cy.findByRole('dialog')
        .filter(':visible')
        .contains('button', /into workspace/i)
        .filter(':enabled')
        .click();
      // the url should changed
      cy.location('pathname').should('equal', `/${name}`);
    });

    it('should have an event log when creating a workspace fails', () => {
      const workspaceName = 'workspace2';
      const node: NodeRequest = generateNodeIfNeed();

      cy.visit('/');
      cy.createNode(node);

      // create a zookeeper by native api
      cy.request('POST', 'api/zookeepers', {
        name: workspaceName,
        group: GROUP.ZOOKEEPER,
        nodeNames: [node.hostname],
      });

      cy.createWorkspace({
        workspaceName,
        node,
      });

      cy.findByTestId('close-intro-button').filter(':visible').click();
      cy.findByTitle('Event logs').click();
      cy.findByTestId('event-log-list').within(() => {
        cy.findAllByText(`Failed to create workspace ${workspaceName}.`).should(
          'exist',
        );
      });
    });
  });
});
