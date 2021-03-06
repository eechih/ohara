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

package oharastream.ohara.stream;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import oharastream.ohara.common.annotations.VisibleForTesting;
import oharastream.ohara.common.data.Row;
import oharastream.ohara.common.data.Serializer;
import oharastream.ohara.common.util.CommonUtils;
import oharastream.ohara.kafka.Consumer;
import oharastream.ohara.kafka.Producer;
import oharastream.ohara.kafka.TopicAdmin;
import org.apache.log4j.Logger;
import org.junit.Assert;

@VisibleForTesting
public class StreamTestUtils {
  private static final Logger log = Logger.getLogger(StreamTestUtils.class);

  public static void createTopic(
      TopicAdmin client, String topic, int partitions, short replications) {
    client
        .topicCreator()
        .numberOfPartitions(partitions)
        .numberOfReplications(replications)
        .topicName(topic)
        .create();
  }

  public static void produceData(Producer<Row, byte[]> producer, List<Row> rows, String topic) {
    rows.forEach(
        row -> {
          try {
            producer.sender().key(row).value(new byte[0]).topicName(topic).send().get();
          } catch (InterruptedException | ExecutionException e) {
            Assert.fail(e.getMessage());
          }
        });
  }

  public static void assertResult(
      TopicAdmin client, String toTopic, List<Row> expectedContainedRows, int expectedSize) {
    Consumer<Row, byte[]> consumer =
        Consumer.builder()
            .topicName(toTopic)
            .connectionProps(client.connectionProps())
            .groupId("group-" + CommonUtils.randomString(5))
            .offsetFromBegin()
            .keySerializer(Serializer.ROW)
            .valueSerializer(Serializer.BYTES)
            .build();

    List<Consumer.Record<Row, byte[]>> records =
        consumer.poll(Duration.ofSeconds(30), expectedSize);
    records.forEach(
        record -> log.info(String.format("record: %s", record.key().orElse(Row.EMPTY).toString())));
    Assert.assertTrue(
        records.stream()
            .map(
                record -> {
                  Assert.assertTrue(record.key().isPresent());
                  return record.key().get();
                })
            .collect(Collectors.toList())
            .containsAll(expectedContainedRows));

    consumer.close();
  }
}
