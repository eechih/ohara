#!/bin/bash
#
# Copyright 2019 is-land
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

mkdir -p ${HADOOP_DATANODE_FOLDER}
chmod 755 -R ${HADOOP_DATANODE_FOLDER}

# Build config xml file for the HDFS

if [[ -z "${HADOOP_NAMENODE}" ]];then
  echo "HADOOP_NAMENODE environment variable is required!!!"
  exit 2
fi
echo "HADOOP_NAMENODE: ${HADOOP_NAMENODE}"
bash ${HADOOP_HOME}/bin/hdfs-site.sh > ${HADOOP_CONF_DIR}/hdfs-site.xml
${HADOOP_HOME}/bin/hdfs --config ${HADOOP_CONF_DIR} datanode