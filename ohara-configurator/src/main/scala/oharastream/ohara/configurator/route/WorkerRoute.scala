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

package oharastream.ohara.configurator.route

import akka.http.scaladsl.server
import oharastream.ohara.agent._
import oharastream.ohara.client.configurator.v0.ConnectorApi.ConnectorInfo
import oharastream.ohara.client.configurator.v0.WorkerApi
import oharastream.ohara.client.configurator.v0.WorkerApi._
import oharastream.ohara.common.setting.ObjectKey
import oharastream.ohara.common.util.CommonUtils
import oharastream.ohara.configurator.route.ObjectChecker.Condition.{RUNNING, STOPPED}
import oharastream.ohara.configurator.route.hook.{HookBeforeDelete, HookOfAction, HookOfCreation, HookOfUpdating}
import oharastream.ohara.configurator.store.{DataStore, MetricsCache}

import scala.concurrent.{ExecutionContext, Future}
object WorkerRoute {
  private[this] def creationToClusterInfo(
    creation: Creation
  )(implicit objectChecker: ObjectChecker, executionContext: ExecutionContext): Future[WorkerClusterInfo] =
    objectChecker.checkList
      .nodeNames(creation.nodeNames)
      .brokerCluster(creation.brokerClusterKey)
      .files(creation.pluginKeys)
      .files(creation.sharedJarKeys)
      .references(creation.settings, DEFINITIONS)
      .check()
      .map(_.fileInfos)
      .map { fileInfos =>
        WorkerClusterInfo(
          settings = WorkerApi.access.request
            .settings(creation.settings)
            .pluginKeys(fileInfos.map(_.key).toSet)
            .creation
            .settings,
          aliveNodes = Set.empty,
          state = None,
          error = None,
          lastModified = CommonUtils.current()
        )
      }

  private[this] def hookOfCreation(
    implicit objectChecker: ObjectChecker,
    executionContext: ExecutionContext
  ): HookOfCreation[Creation, WorkerClusterInfo] =
    creationToClusterInfo(_)

  private[this] def hookOfUpdating(
    implicit objectChecker: ObjectChecker,
    executionContext: ExecutionContext
  ): HookOfUpdating[Updating, WorkerClusterInfo] =
    (key: ObjectKey, updating: Updating, previousOption: Option[WorkerClusterInfo]) =>
      previousOption match {
        case None => creationToClusterInfo(WorkerApi.access.request.settings(updating.settings).key(key).creation)
        case Some(previous) =>
          objectChecker.checkList.workerCluster(key, STOPPED).check().flatMap { _ =>
            // 1) fill the previous settings (if exists)
            // 2) overwrite previous settings by updated settings
            // 3) fill the ignored settings by creation
            creationToClusterInfo(
              WorkerApi.access.request
                .settings(previous.settings)
                .settings(keepEditableFields(updating.settings, WorkerApi.DEFINITIONS))
                // the key is not in update's settings so we have to add it to settings
                .key(key)
                .creation
            )
          }
      }

  private[this] def checkConflict(workerClusterInfo: WorkerClusterInfo, connectorInfos: Seq[ConnectorInfo]): Unit = {
    val conflictConnectors = connectorInfos.filter(_.workerClusterKey == workerClusterInfo.key)
    if (conflictConnectors.nonEmpty)
      throw new IllegalArgumentException(
        s"you can't remove worker cluster:${workerClusterInfo.key} since it is used by connector:${conflictConnectors.map(_.key).mkString(",")}"
      )
  }

  private[this] def hookOfStart(
    implicit objectChecker: ObjectChecker,
    serviceCollie: ServiceCollie,
    executionContext: ExecutionContext
  ): HookOfAction[WorkerClusterInfo] =
    (workerClusterInfo: WorkerClusterInfo, _, _) =>
      objectChecker.checkList
      // node names check is covered in super route
        .brokerCluster(workerClusterInfo.brokerClusterKey, RUNNING)
        .allWorkers()
        .check()
        .map(_.runningWorkers)
        .flatMap { runningWorkerClusters =>
          // check group id
          runningWorkerClusters.find(_.groupId == workerClusterInfo.groupId).foreach { cluster =>
            throw new IllegalArgumentException(
              s"group id:${workerClusterInfo.groupId} is used by wk cluster:${cluster.name}"
            )
          }

          // check setting topic
          runningWorkerClusters.find(_.configTopicName == workerClusterInfo.configTopicName).foreach { cluster =>
            throw new IllegalArgumentException(
              s"configTopicName:${workerClusterInfo.configTopicName} is used by wk cluster:${cluster.name}"
            )
          }

          // check offset topic
          runningWorkerClusters.find(_.offsetTopicName == workerClusterInfo.offsetTopicName).foreach { cluster =>
            throw new IllegalArgumentException(
              s"offsetTopicName:${workerClusterInfo.offsetTopicName} is used by wk cluster:${cluster.name}"
            )
          }

          // check status topic
          runningWorkerClusters.find(_.statusTopicName == workerClusterInfo.statusTopicName).foreach { cluster =>
            throw new IllegalArgumentException(
              s"statusTopicName:${workerClusterInfo.statusTopicName} is used by wk cluster:${cluster.name}"
            )
          }

          serviceCollie.workerCollie.creator
            .settings(workerClusterInfo.settings)
            .name(workerClusterInfo.name)
            .group(workerClusterInfo.group)
            .clientPort(workerClusterInfo.clientPort)
            .jmxPort(workerClusterInfo.jmxPort)
            .brokerClusterKey(workerClusterInfo.brokerClusterKey)
            .groupId(workerClusterInfo.groupId)
            .configTopicName(workerClusterInfo.configTopicName)
            .configTopicReplications(workerClusterInfo.configTopicReplications)
            .offsetTopicName(workerClusterInfo.offsetTopicName)
            .offsetTopicPartitions(workerClusterInfo.offsetTopicPartitions)
            .offsetTopicReplications(workerClusterInfo.offsetTopicReplications)
            .statusTopicName(workerClusterInfo.statusTopicName)
            .statusTopicPartitions(workerClusterInfo.statusTopicPartitions)
            .statusTopicReplications(workerClusterInfo.statusTopicReplications)
            .pluginKeys(workerClusterInfo.pluginKeys)
            .sharedJarKeys(workerClusterInfo.sharedJarKeys)
            .nodeNames(workerClusterInfo.nodeNames)
            .threadPool(executionContext)
            .create()
        }
        .map(_ => ())

  private[this] def hookBeforeStop(
    implicit objectChecker: ObjectChecker,
    executionContext: ExecutionContext
  ): HookOfAction[WorkerClusterInfo] =
    (workerClusterInfo: WorkerClusterInfo, _, _) =>
      objectChecker.checkList.allConnectors().check().map(_.runningConnectors).map(checkConflict(workerClusterInfo, _))

  private[this] def hookBeforeDelete(
    implicit objectChecker: ObjectChecker,
    executionContext: ExecutionContext
  ): HookBeforeDelete =
    key =>
      objectChecker.checkList
        .allConnectors()
        .workerCluster(key, STOPPED)
        .check()
        .map(report => (report.workerClusterInfos.keys.head, report.connectorInfos.keys.toSeq))
        .map {
          case (workerClusterInfo, connectorInfos) => checkConflict(workerClusterInfo, connectorInfos)
        }
        .recover {
          // the duplicate deletes are legal to ohara
          case e: ObjectCheckException if e.nonexistent.contains(key) => ()
          case e: Throwable                                           => throw e
        }
        .map(_ => ())

  def apply(
    implicit store: DataStore,
    objectChecker: ObjectChecker,
    meterCache: MetricsCache,
    workerCollie: WorkerCollie,
    serviceCollie: ServiceCollie,
    executionContext: ExecutionContext
  ): server.Route =
    clusterRoute[WorkerClusterInfo, Creation, Updating](
      root = WORKER_PREFIX_PATH,
      hookOfCreation = hookOfCreation,
      hookOfUpdating = hookOfUpdating,
      hookOfStart = hookOfStart,
      hookBeforeStop = hookBeforeStop,
      hookBeforeDelete = hookBeforeDelete
    )
}
