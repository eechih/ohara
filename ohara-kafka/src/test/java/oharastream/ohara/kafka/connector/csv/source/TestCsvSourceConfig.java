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

package oharastream.ohara.kafka.connector.csv.source;

import static oharastream.ohara.kafka.connector.csv.CsvConnectorDefinitions.COMPLETED_FOLDER_KEY;
import static oharastream.ohara.kafka.connector.csv.CsvConnectorDefinitions.ERROR_FOLDER_KEY;
import static oharastream.ohara.kafka.connector.csv.CsvConnectorDefinitions.FILE_ENCODE_KEY;
import static oharastream.ohara.kafka.connector.csv.CsvConnectorDefinitions.INPUT_FOLDER_KEY;
import static oharastream.ohara.kafka.connector.csv.CsvConnectorDefinitions.MAXIMUM_NUMBER_OF_LINES_KEY;
import static oharastream.ohara.kafka.connector.csv.CsvConnectorDefinitions.TASK_HASH_KEY;
import static oharastream.ohara.kafka.connector.csv.CsvConnectorDefinitions.TASK_TOTAL_KEY;
import static oharastream.ohara.kafka.connector.json.ConnectorDefUtils.COLUMNS_DEFINITION;
import static oharastream.ohara.kafka.connector.json.ConnectorDefUtils.TOPIC_NAMES_DEFINITION;

import java.util.Collections;
import java.util.Optional;
import oharastream.ohara.common.data.Column;
import oharastream.ohara.common.data.DataType;
import oharastream.ohara.common.rule.OharaTest;
import oharastream.ohara.common.setting.PropGroup;
import oharastream.ohara.common.util.CommonUtils;
import oharastream.ohara.kafka.connector.TaskSetting;
import org.junit.Assert;
import org.junit.Test;

public class TestCsvSourceConfig extends OharaTest {

  private static CsvSourceConfig config(String key, String value) {
    return CsvSourceConfig.of(TaskSetting.of(Collections.singletonMap(key, value)));
  }

  @Test
  public void testMaximumNumberOfLines() {
    CsvSourceConfig config = config(MAXIMUM_NUMBER_OF_LINES_KEY, "10");
    Assert.assertEquals(config.maximumNumberOfLines(), 10);
  }

  @Test
  public void testHash() {
    CsvSourceConfig config = config(TASK_HASH_KEY, "10");
    Assert.assertEquals(config.hash(), 10);
  }

  @Test
  public void testTotal() {
    CsvSourceConfig config = config(TASK_TOTAL_KEY, "10");
    Assert.assertEquals(config.total(), 10);
  }

  @Test
  public void testInputFolder() {
    CsvSourceConfig config = config(INPUT_FOLDER_KEY, "10");
    Assert.assertEquals(config.inputFolder(), "10");
  }

  @Test
  public void testCompleteFolder() {
    CsvSourceConfig config = config(COMPLETED_FOLDER_KEY, "10");
    Assert.assertEquals(config.completedFolder().get(), "10");
  }

  @Test
  public void testOptionalCompleteFolder() {
    Assert.assertEquals(
        config(CommonUtils.randomString(), CommonUtils.randomString()).completedFolder(),
        Optional.empty());
  }

  @Test
  public void testErrorFolder() {
    CsvSourceConfig config = config(ERROR_FOLDER_KEY, "10");
    Assert.assertEquals(config.errorFolder().get(), "10");
  }

  @Test
  public void testEncode() {
    CsvSourceConfig config = config(FILE_ENCODE_KEY, "10");
    Assert.assertEquals(config.encode(), "10");
  }

  @Test
  public void testTopicNames() {
    CsvSourceConfig config = config(TOPIC_NAMES_DEFINITION.key(), "10");
    Assert.assertEquals(config.topicNames(), Collections.singletonList("10"));
  }

  @Test
  public void testColumns() {
    Column column =
        Column.builder()
            .name(CommonUtils.randomString())
            .dataType(DataType.BOOLEAN)
            .order(1)
            .build();
    CsvSourceConfig config =
        config(COLUMNS_DEFINITION.key(), PropGroup.ofColumn(column).toJsonString());
    Assert.assertEquals(config.columns(), Collections.singletonList(column));
  }
}
