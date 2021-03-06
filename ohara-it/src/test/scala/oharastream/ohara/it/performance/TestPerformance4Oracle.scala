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

package oharastream.ohara.it.performance

import oharastream.ohara.client.configurator.v0.{ConnectorApi, TopicApi}
import oharastream.ohara.common.setting.ConnectorKey
import oharastream.ohara.common.util.CommonUtils
import oharastream.ohara.connector.jdbc.source.JDBCSourceConnector
import oharastream.ohara.it.category.PerformanceGroup
import org.junit.Test
import org.junit.experimental.categories.Category
import spray.json.{JsNumber, JsString}

@Category(Array(classOf[PerformanceGroup]))
class TestPerformance4Oracle extends BasicTestPerformance4Jdbc {
  override protected val tableName: String =
    s"TABLE${CommonUtils.randomString().toUpperCase()}"

  @Test
  def test(): Unit = {
    createTable()
    setupInputData(timeoutOfInputData)
    loopInputDataThread(setupInputData)
    createTopic()
    try {
      setupConnector(
        connectorKey = ConnectorKey.of(groupName, CommonUtils.randomString(5)),
        className = classOf[JDBCSourceConnector].getName(),
        settings = Map(
          oharastream.ohara.connector.jdbc.source.DB_URL                -> JsString(url),
          oharastream.ohara.connector.jdbc.source.DB_USERNAME           -> JsString(user),
          oharastream.ohara.connector.jdbc.source.DB_PASSWORD           -> JsString(password),
          oharastream.ohara.connector.jdbc.source.DB_TABLENAME          -> JsString(tableName),
          oharastream.ohara.connector.jdbc.source.TIMESTAMP_COLUMN_NAME -> JsString(timestampColumnName),
          oharastream.ohara.connector.jdbc.source.DB_SCHEMA_PATTERN     -> JsString(user),
          oharastream.ohara.connector.jdbc.source.JDBC_FETCHDATA_SIZE   -> JsNumber(10000),
          oharastream.ohara.connector.jdbc.source.JDBC_FLUSHDATA_SIZE   -> JsNumber(10000)
        )
      )
      sleepUntilEnd()
    } finally if (needDeleteData) client.dropTable(tableName)
  }

  override protected def afterStoppingConnectors(
    connectorInfos: Seq[ConnectorApi.ConnectorInfo],
    topicInfos: Seq[TopicApi.TopicInfo]
  ): Unit = {}
}
