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

package oharastream.ohara.shabondi

import java.time.{Duration => JDuration}
import java.util.concurrent.atomic.AtomicInteger

import oharastream.ohara.common.util.VersionUtils
import oharastream.ohara.common.setting.{SettingDef, WithDefinitions}
import oharastream.ohara.common.setting.SettingDef.Type

import scala.collection.JavaConverters._
import scala.collection.mutable

object ShabondiDefinitions {
  private val basicDefinitionMap  = mutable.Map.empty[String, SettingDef]
  private val sourceDefinitionMap = mutable.Map.empty[String, SettingDef]
  private val sinkDefinitionMap   = mutable.Map.empty[String, SettingDef]
  private val orderCounter        = new AtomicInteger(0)
  private def orderInGroup(): Int = orderCounter.getAndIncrement

  val CORE_GROUP                 = "core"
  val IMAGE_NAME_DEFAULT: String = s"oharastream/shabondi:${VersionUtils.VERSION}"

  def basicDefinitions: Seq[SettingDef]      = basicDefinitionMap.values.toList
  def sourceOnlyDefinitions: Seq[SettingDef] = sourceDefinitionMap.values.toList
  def sinkOnlyDefinitions: Seq[SettingDef]   = sinkDefinitionMap.values.toList

  def sourceDefinitions: Seq[SettingDef] = basicDefinitionMap.values.toList ++ sourceDefinitionMap.values.toList
  def sinkDefinitions: Seq[SettingDef]   = basicDefinitionMap.values.toList ++ sinkDefinitionMap.values.toList

  val GROUP_DEFINITION = SettingDef.builder
    .group(CORE_GROUP)
    .key("group")
    .orderInGroup(orderInGroup())
    .displayName("Shabondi group")
    .documentation("The unique group of this Shabondi")
    .optional("default")
    .permission(SettingDef.Permission.CREATE_ONLY)
    .build
    .registerTo(basicDefinitionMap)

  val NAME_DEFINITION = SettingDef.builder
    .group(CORE_GROUP)
    .key("name")
    .orderInGroup(orderInGroup())
    .displayName("Shabondi group")
    .documentation("The unique group of this Shabondi")
    .stringWithRandomDefault
    .permission(SettingDef.Permission.CREATE_ONLY)
    .build
    .registerTo(basicDefinitionMap)

  val IMAGE_NAME_DEFINITION = SettingDef.builder
    .group(CORE_GROUP)
    .key("imageName")
    .orderInGroup(orderInGroup())
    .displayName("Image name")
    .documentation("The image name of this Shabondi running with")
    .optional(IMAGE_NAME_DEFAULT)
    .permission(SettingDef.Permission.READ_ONLY) // In manager, user cannot change the image name
    .build
    .registerTo(basicDefinitionMap)

  val SERVER_CLASS_DEFINITION = SettingDef.builder
    .group(CORE_GROUP)
    .key("shabondi.serverClass")
    .orderInGroup(orderInGroup())
    .required(Set(ShabondiType.Source.className, ShabondiType.Sink.className).asJava)
    .documentation("the server class name of Shabondi service")
    .permission(SettingDef.Permission.CREATE_ONLY)
    .build
    .registerTo(basicDefinitionMap)

  val CLIENT_PORT_DEFINITION = SettingDef.builder
    .group(CORE_GROUP)
    .key("shabondi.client.port")
    .orderInGroup(orderInGroup())
    .required(Type.BINDING_PORT)
    .displayName("The port used to expose Shabondi service")
    .build
    .registerTo(basicDefinitionMap)

  val BROKER_CLUSTER_KEY_DEFINITION = SettingDef.builder
    .group(CORE_GROUP)
    .key("brokerClusterKey")
    .orderInGroup(orderInGroup())
    .required(Type.OBJECT_KEY)
    .reference(SettingDef.Reference.BROKER_CLUSTER)
    .displayName("Broker cluster key")
    .documentation("the key of broker cluster used to transfer data for this Shabondi")
    .build
    .registerTo(basicDefinitionMap)

  val BROKERS_DEFINITION = SettingDef.builder
    .group(CORE_GROUP)
    .key("shabondi.brokers")
    .orderInGroup(orderInGroup())
    .required(Type.STRING)
    .displayName("Broker list")
    .documentation("The broker list of current workspace")
    .internal
    .build
    .registerTo(basicDefinitionMap)

  val VERSION_DEFINITION: SettingDef = WithDefinitions
    .versionDefinition(VersionUtils.VERSION)
    .registerTo(basicDefinitionMap)

  val REVISION_DEFINITION: SettingDef = WithDefinitions
    .revisionDefinition(VersionUtils.REVISION)
    .registerTo(basicDefinitionMap)

  val AUTHOR_DEFINITION: SettingDef = WithDefinitions
    .authorDefinition(VersionUtils.USER)
    .registerTo(basicDefinitionMap)

  implicit private class RegisterSettingDef(settingDef: SettingDef) {
    def registerTo(groups: mutable.Map[String, SettingDef]*): SettingDef = {
      groups.foreach { group =>
        group += (settingDef.key -> settingDef)
      }
      settingDef
    }
  }

  //-------------- Definitions of Shabondi Source -----------------

  val SOURCE_KIND_DEFINITION: SettingDef = WithDefinitions
    .kindDefinition(WithDefinitions.Type.SOURCE.key)
    .registerTo(sourceDefinitionMap)

  val SOURCE_TO_TOPICS_DEFINITION = SettingDef.builder
    .key("shabondi.source.toTopics")
    .group(CORE_GROUP)
    .orderInGroup(orderInGroup())
    .reference(SettingDef.Reference.TOPIC)
    .displayName("Target topic")
    .documentation("The topic that Shabondi(source) will push rows into")
    .optional(Type.OBJECT_KEYS)
    .build
    .registerTo(sourceDefinitionMap)

  //-------------- Definitions of Shabondi Sink -----------------

  val SINK_KIND_DEFINITION: SettingDef = WithDefinitions
    .kindDefinition(WithDefinitions.Type.SINK.key)
    .registerTo(sinkDefinitionMap)

  val SINK_FROM_TOPICS_DEFINITION = SettingDef.builder
    .key("shabondi.sink.fromTopics")
    .group(CORE_GROUP)
    .orderInGroup(orderInGroup())
    .reference(SettingDef.Reference.TOPIC)
    .displayName("Source topic")
    .documentation("The topic that Shabondi(sink) will pull rows from")
    .optional(Type.OBJECT_KEYS)
    .build
    .registerTo(sinkDefinitionMap)

  val SINK_POLL_TIMEOUT_DEFINITION = SettingDef.builder
    .key("shabondi.sink.poll.timeout")
    .group(CORE_GROUP)
    .orderInGroup(orderInGroup())
    .optional(JDuration.ofMillis(1500))
    .displayName("Poll timeout")
    .documentation("The timeout value(milliseconds) that each poll from topic")
    .build
    .registerTo(sinkDefinitionMap)

  val SINK_GROUP_IDLETIME = SettingDef.builder
    .key("shabondi.sink.group.idletime")
    .group(CORE_GROUP)
    .orderInGroup(orderInGroup())
    .optional(JDuration.ofMinutes(3))
    .displayName("Data group idle time")
    .documentation("The resource will be released automatically if the data group is not used more than idle time.")
    .build
    .registerTo(sinkDefinitionMap)
}