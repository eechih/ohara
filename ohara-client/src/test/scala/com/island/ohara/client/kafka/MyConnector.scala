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

package com.island.ohara.client.kafka

import java.util
import java.util.Collections

import com.island.ohara.kafka.connector.json.SettingDefinition
import com.island.ohara.kafka.connector.json.SettingDefinition.Type
import com.island.ohara.kafka.connector.{RowSourceConnector, RowSourceTask, TaskConfig}

import scala.collection.JavaConverters._

class MyConnector extends RowSourceConnector {
  private[this] var config: TaskConfig = _

  override protected def _taskClass(): Class[_ <: RowSourceTask] = classOf[MyConnectorTask]

  override protected def _taskConfigs(maxTasks: Int): util.List[TaskConfig] =
    new util.ArrayList[TaskConfig](Seq.fill(maxTasks)(config).asJavaCollection)

  override protected def _start(config: TaskConfig): Unit = this.config = config

  override protected def _stop(): Unit = {
    // do nothing
  }

  override protected def _definitions(): util.List[SettingDefinition] = Collections.singletonList(
    // used by TestWorkerClient.passIncorrectDuration
    SettingDefinition.builder().key(MyConnector.DURATION_KEY).optional().valueType(Type.DURATION).build()
  )
}

object MyConnector {
  val DURATION_KEY: String = "myconnector.duration"
}
