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

/// <reference types="cypress" />

declare namespace Cypress {
  type FixtureRequest = {
    fixturePath: string;
    name: string;
    group: string;
    tags?: object;
  };

  interface Chainable {
    createJar: (file: FixtureRequest) => Promise<FixtureResponse>;
    createNode: (node?: NodeRequest) => Chainable<NodeRequest>;
    createNodeIfNotExists: (node: NodeRequest) => Chainable<NodeResponse>;
    createWorkspace: ({
      workspaceName,
      node,
      closeOnFailureOrFinish,
    }: {
      workspaceName?: string;
      node?: NodeRequest;
      closeOnFailureOrFinish?: boolean;
    }) => Chainable<null>;
    produceTopicData: (
      workspaceName?: string,
      topicName?: string,
    ) => Chainable<void>;
    deleteAllServices: () => Chainable<null>;
    /**
     * Get the _&lt;td /&gt;_ elements by required parameters.
     * <p> This function has the following combination:
     *
     * <p> 1. `columnName`: filter all _&lt;td /&gt;_ elements of specific column.
     *
     * <p> 2. `columnName + columnValue`: filter the _&lt;td /&gt;_ element of specific column and value.
     *
     * <p> 3. `columnName + rowFilter`: filter the _&lt;td /&gt;_ element of specific column in specific rows.
     *
     * <p> 4. `columnName + columnValue + rowFilter`: filter the _&lt;td /&gt;_ element of specific column in specific rows.
     *
     * @param {string} columnName the filtered header of table cell
     * @param {string} columnValue the filtered value of table cell
     * @param {Function} rowFilter given a function to filter the result of elements
     */
    getTableCellByColumn: (
      $table: JQuery<HTMLTableElement>,
      columnName: string,
      columnValue?: string,
      rowFilter?: (row: JQuery<HTMLTableElement>) => boolean,
    ) => Chainable<JQuery<HTMLElement | HTMLElement[]>>;
    // Paper
    // Drag & Drop
    dragAndDrop: (
      shiftX: number,
      shiftY: number,
    ) => Chainable<JQuery<HTMLElement>>;
    addNode: (node?: NodeRequest) => Chainable<null>;
    addElement: (element: ElementParameters) => Chainable<null>;
    addElements: (elements: ElementParameters[]) => Chainable<null>;
    removeElement: (name: string) => Chainable<null>;

    /**
     * Get a Paper element by name
     * @param {string} name Element name
     * @param {boolean} isTopic If element is a topic
     * @example cy.getElement('mySource').should('have.text', 'running');
     * @example cy.getElement('myTopic').should('have.class', 'running');
     */

    getElementStatus: (
      name: string,
      isTopic?: boolean,
    ) => Chainable<JQuery<HTMLElement>>;
    getCell: (name: string) => Chainable<HTMLElement>;
    cellAction: (name: string, action: CELL_ACTION) => Chainable<HTMLElement>;

    /**
     * Create a connection between elements
     * @param {string[]} elements Element list, the connection will be created following the list order
     * @param {boolean} waitForApiCall If the command should wait for pipeline update API call to finish or not
     * @example cy.createConnection(['ftpSource', 'topic1', 'consoleSink']); // create a connection of ftpSource -> topic1 -> consoleSink
     */

    createConnections: (
      elements: string[],
      waitForApiCall?: boolean,
    ) => Chainable<null>;
    uploadStreamJar: () => Chainable<null>;
    // Pipeline
    createPipeline: (name?: string) => Chainable<null>;
    startPipeline: (name: string) => Chainable<null>;
    stopPipeline: (name: string) => Chainable<null>;
    deletePipeline: (name: string) => Chainable<null>;
    stopAndDeleteAllPipelines: () => Chainable<null>;
    // Settings
    switchSettingSection: (
      section: SettingSection,
      listItem?: string,
    ) => Chainable<null>;
    createSharedTopic: (name?: string) => Chainable<null>;
    closeIntroDialog: () => Chainable<null>;
  }
}