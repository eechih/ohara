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

package oharastream.ohara.kafka;

import java.util.Collections;
import java.util.Map;
import java.util.concurrent.CompletionStage;
import oharastream.ohara.common.rule.OharaTest;
import org.junit.Test;

public class TestTopicCreator extends OharaTest {

  private static class FakeTopicCreator extends TopicCreator {
    @Override
    protected CompletionStage<Void> doCreate(
        int numberOfPartitions,
        short numberOfReplications,
        Map<String, String> options,
        String name) {
      return null;
    }
  }

  private static TopicCreator fake() {
    return new FakeTopicCreator();
  }

  @Test(expected = IllegalArgumentException.class)
  public void illegalNumberOfPartitions() {
    fake().numberOfPartitions(-1);
  }

  @Test(expected = IllegalArgumentException.class)
  public void illegalNumberOfReplications() {
    fake().numberOfReplications((short) -1);
  }

  @Test(expected = NullPointerException.class)
  public void nullOptions() {
    fake().options(null);
  }

  @Test(expected = IllegalArgumentException.class)
  public void emptyOptions() {
    fake().options(Collections.emptyMap());
  }
}
