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

import java.io.{File, FileOutputStream}
import java.nio.file.Files

import com.island.ohara.client.configurator.v0.{BrokerApi, FileInfoApi, StreamApi, TopicApi, WorkerApi}
import com.island.ohara.common.rule.OharaTest
import com.island.ohara.common.setting.ObjectKey
import com.island.ohara.common.util.{CommonUtils, Releasable}
import com.island.ohara.configurator.Configurator
import org.junit.{After, Test}
import org.scalatest.Matchers
import spray.json.{JsNumber, JsString}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}
class TestFileInfoRoute extends OharaTest with Matchers {

  private[this] val configurator: Configurator = Configurator.builder.fake().build()
  private[this] val streamApi: StreamApi.Access =
    StreamApi.access.hostname(configurator.hostname).port(configurator.port)
  private[this] val fileApi: FileInfoApi.Access =
    FileInfoApi.access.hostname(configurator.hostname).port(configurator.port)

  private[this] def tmpFile(bytes: Array[Byte]): File = {
    val f = CommonUtils.createTempJar(CommonUtils.randomString(10))
    val output = new FileOutputStream(f)
    try output.write(bytes)
    finally output.close()
    f
  }

  private[this] def result[T](f: Future[T]): T = Await.result(f, Duration("40 seconds"))

  @Test
  def testUpload(): Unit = {
    // upload jar to random group
    val data = CommonUtils.randomString(10).getBytes
    val f = tmpFile(data)
    val jar = result(fileApi.request.file(f).upload())
    jar.size shouldBe f.length()
    f.getName.contains(jar.name) shouldBe true
    result(fileApi.list()).size shouldBe 1

    // upload jar to specific group
    val group = CommonUtils.randomString(10)
    val jarWithGroup = result(fileApi.request.group(group).file(f).upload())
    jarWithGroup.group shouldBe group
    jarWithGroup.size shouldBe data.size

    // since name == name, use same upload jar will get same name
    jarWithGroup.name shouldBe jar.name

    f.deleteOnExit()
  }

  @Test
  def testUploadOutOfLimitFile(): Unit = {
    val bytes = new Array[Byte](DEFAULT_FILE_SIZE_BYTES.toInt + 1)
    val f = tmpFile(bytes)

    an[IllegalArgumentException] should be thrownBy result(fileApi.request.file(f).upload())

    f.deleteOnExit()
  }

  @Test
  def testUploadWithNewName(): Unit = {
    val name = CommonUtils.randomString()
    val file = tmpFile(CommonUtils.randomString(10).getBytes)
    val fileInfo = result(fileApi.request.file(file).name(name).upload())
    result(fileApi.list()).size shouldBe 1
    fileInfo.group shouldBe com.island.ohara.client.configurator.v0.GROUP_DEFAULT
    fileInfo.name shouldBe name
    fileInfo.size shouldBe file.length()
  }

  @Test
  def failToDuplicateUpload(): Unit = {
    val file = tmpFile(CommonUtils.randomString(10).getBytes)
    result(fileApi.request.file(file).upload())
    intercept[IllegalArgumentException] {
      result(fileApi.request.file(file).upload())
    }.getMessage should include("exist")
  }

  @Test
  def testDelete(): Unit = {
    val data = CommonUtils.randomString(10).getBytes
    val f = tmpFile(data)
    val jar = result(fileApi.request.file(f).upload())
    jar.size shouldBe f.length()
    f.getName.contains(jar.name) shouldBe true
    result(fileApi.list()).size shouldBe 1

    result(fileApi.delete(jar.key))
    result(fileApi.list()).size shouldBe 0

    f.deleteOnExit()
  }

  @Test
  def testDeleteJarUsedByStreamApp(): Unit = {
    val data = CommonUtils.randomString(10).getBytes
    val name = CommonUtils.randomString(10)
    val f = tmpFile(data)
    // upload jar
    val jar = result(fileApi.request.file(f).upload())
    val brokerClusterInfo = result(BrokerApi.access.hostname(configurator.hostname).port(configurator.port).list()).head
    val fromTopic = result(
      TopicApi.access
        .hostname(configurator.hostname)
        .port(configurator.port)
        .request
        .brokerClusterKey(brokerClusterInfo.key)
        .create())
    val toTopic = result(
      TopicApi.access
        .hostname(configurator.hostname)
        .port(configurator.port)
        .request
        .brokerClusterKey(brokerClusterInfo.key)
        .create())
    // create streamApp property
    val streamInfo = result(
      streamApi.request
        .name(name)
        .jarKey(jar.key)
        .fromTopicKey(fromTopic.key)
        .toTopicKey(toTopic.key)
        .brokerClusterKey(brokerClusterInfo.key)
        .nodeNames(brokerClusterInfo.nodeNames)
        .create())
    // cannot delete a used jar
    val thrown = the[IllegalArgumentException] thrownBy result(fileApi.delete(jar.key))
    thrown.getMessage should include("stream cluster")

    result(streamApi.delete(streamInfo.key))
    // delete is ok after remove property
    result(fileApi.delete(jar.key))

    // the jar should be disappear
    an[IllegalArgumentException] should be thrownBy result(fileApi.get(jar.key))
  }

  @Test
  def duplicateDeleteStreamProperty(): Unit =
    (0 to 10).foreach(_ =>
      result(fileApi.delete(ObjectKey.of(CommonUtils.randomString(5), CommonUtils.randomString(5)))))

  @Test
  def updateTags(): Unit = {
    val file = tmpFile(CommonUtils.randomString().getBytes())
    val fileInfo = result(fileApi.request.file(file).upload())
    fileInfo.tags shouldBe Map.empty

    val tags = Map(
      "a" -> JsNumber(123),
      "B" -> JsString(CommonUtils.randomString())
    )
    val fileInfo2 = result(fileApi.request.name(fileInfo.name).group(fileInfo.group).tags(tags).update())
    fileInfo2.group shouldBe fileInfo.group
    fileInfo2.name shouldBe fileInfo.name
    fileInfo2.tags shouldBe tags
  }

  @Test
  def failToRemoveFileUsedByWorkerCluster(): Unit = {
    val data = CommonUtils.randomString(10).getBytes
    val f = tmpFile(data)
    val jar = result(fileApi.request.file(f).upload())

    val wk = result(
      WorkerApi.access
        .hostname(configurator.hostname)
        .port(configurator.port)
        .request
        .jarKeys(Set(jar.key))
        .nodeName(CommonUtils.randomString())
        .brokerClusterKey(
          result(BrokerApi.access.hostname(configurator.hostname).port(configurator.port).list()).head.key)
        .create())

    an[IllegalArgumentException] should be thrownBy result(fileApi.delete(jar.key))

    result(WorkerApi.access.hostname(configurator.hostname).port(configurator.port).delete(wk.key))
    result(fileApi.delete(jar.key))
  }

  @Test
  def testDownload(): Unit = {
    val data = CommonUtils.randomString(10).getBytes
    val f = tmpFile(data)
    val jar = result(fileApi.request.file(f).upload())
    val input = jar.url.openStream()
    val tempFile = CommonUtils.createTempJar(CommonUtils.randomString(10))
    if (tempFile.exists()) tempFile.delete() shouldBe true
    try Files.copy(input, tempFile.toPath)
    finally input.close()
    tempFile.length() shouldBe jar.size
  }

  @After
  def tearDown(): Unit = Releasable.close(configurator)
}
