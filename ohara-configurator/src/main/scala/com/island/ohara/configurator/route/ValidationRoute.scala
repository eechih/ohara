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

package com.island.ohara.configurator.route
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.model.{ContentTypes, _}
import akka.http.scaladsl.server
import akka.http.scaladsl.server.Directives.{as, complete, entity, path, pathPrefix, put, _}
import com.island.ohara.agent.WorkerCollie
import com.island.ohara.client.configurator.v0.ConnectorApi.Creation
import com.island.ohara.client.configurator.v0.ValidationApi._
import com.island.ohara.common.util.CommonUtils
import com.island.ohara.configurator.store.DataStore
import spray.json.DefaultJsonProtocol._
import spray.json.JsObject

import scala.concurrent.ExecutionContext

private[configurator] object ValidationRoute extends SprayJsonSupport {
  def apply(
    implicit dataStore: DataStore,
    workerCollie: WorkerCollie,
    executionContext: ExecutionContext
  ): server.Route =
    pathPrefix(VALIDATION_PREFIX_PATH) {
      path("node") {
        put {
          entity(as[JsObject])(
            obj =>
              complete(
                Seq(
                  ValidationReport(
                    hostname = obj.fields.get("hostname").map(_.convertTo[String]).getOrElse("unknown"),
                    message = "this is deprecated",
                    pass = true,
                    lastModified = CommonUtils.current()
                  )
                )
              )
          )
        }
      } ~ path(VALIDATION_CONNECTOR_PREFIX_PATH) {
        put {
          entity(as[Creation])(
            req =>
              complete(
                workerClient(req.workerClusterKey)
                  .flatMap {
                    case (cluster, workerClient) =>
                      workerClient
                        .connectorValidator()
                        .settings(req.plain)
                        .className(req.className)
                        // the topic name is composed by group and name. However, the kafka topic is still a pure string.
                        // Hence, we can't just push Ohara topic "key" to kafka topic "name".
                        // The name of topic is a required for connector and hence we have to fill the filed when starting
                        // connector.
                        .topicKeys(req.topicKeys)
                        // add the connector key manually since the arguments exposed to user is "group" and "name" than "key"
                        .connectorKey(req.key)
                        .run()
                  }
                  .map(settingInfo => HttpEntity(ContentTypes.`application/json`, settingInfo.toJsonString))
              )
          )
        }
      }
    }
}
