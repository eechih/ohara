..
.. Copyright 2019 is-land
..
.. Licensed under the Apache License, Version 2.0 (the "License");
.. you may not use this file except in compliance with the License.
.. You may obtain a copy of the License at
..
..     http://www.apache.org/licenses/LICENSE-2.0
..
.. Unless required by applicable law or agreed to in writing, software
.. distributed under the License is distributed on an "AS IS" BASIS,
.. WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
.. See the License for the specific language governing permissions and
.. limitations under the License.
..

.. _rest-shabondi:

Shabondi
==========

Shabondi service play the role of a http proxy service in the Pipeline. Just like connector, there have two kinds of Shabondi service:

* Source: **Shabondi source service** receives data from http request and then writes the data into the linked topic.
* Sink: Users can use http request to read topic data through **Shabondi sink service**



The following are common setting both Shabondi source and sink:

#. name (**string**) — the value of group is always "default". The legal character is number, lowercase alphanumeric characters, or ``.``
#. group (**string**) — the name of this connector. The legal character is number, lowercase alphanumeric characters, or ``.``
#. brokerClusterKey (**object**) — the broker cluster used to store data generated by this worker cluster

   - brokerClusterKey.group (**option(string)**) — the group of cluster
   - brokerClusterKey.name (**string**) — the name of cluster

   .. note::
     the following forms are legal as well. 1) ``{"name": "n"}`` and 2) ``"n"``. Both forms are converted to ``{"group": "default", "name": "n"}``
#. shabondi.class (**string**) — class name of Shabondi service, only the following two class names are legal:

   - Shabondi source: ``oharastream.ohara.shabondi.ShabondiSource``
   - Shabondi sink: ``oharastream.ohara.shabondi.ShabondiSink``

#. shabondi.client.port (**int**) - The Shabondi service client port
#. imageName (**string**) — docker image
#. nodeNames **array(string)** - The nodes that running this Shabondi. Currently, Shabondi not support multiple nodes deployment. So nodeNames only can be contained one node when start shabondi service, otherwise you'll get an error.
#. tags (**object**) — the extra parameter for this object
#. routes (**object**) -
#. jmxPort (**int**) - the JVM jmx port for Shabondi service
#. xms (**int**) - the initial memory allocation pool for JVM
#. xmx (**int**) - the maximum memory allocation pool for JVM
#. author (**string**) —
#. revision (**string**) —
#. version (**string**) —

Shabondi Source only settings
  #. shabondi.source.toTopics (**array(object)**) - The topic which Shabondi source service would write the data to.

Shabondi Sink only settings
  #. shabondi.sink.fromTopics (**array(object)**) - The topic which Shabondi sink service would read the data from.
  #. shabondi.sink.group.idletime (**duration**) - The maximum idle time of each sink data group.
  #. shabondi.sink.poll.timeout(**duration**) - The maximum time of each consumer poll.

The following information are updated by Ohara
  #. lastModified (**long**) — the last time to update this shabondi service
  #. state (**option(string)**) — the state of a started shabondi service
  #. aliveNodes (**Set(string)**) — the nodes hosting this shabondi service
  #. error (**option(string)**) — the error message from a failed shabondi service. If the a shabondi service is fine or un-started, you won’t get this field.
  #. :ref:`nodeMetrics <connector-metrics>` (**object**) — the metrics from a running connector

    - meters (**array(object)**) — the metrics in meter type

      - meters[i].name (**string**) — the number of this meter (normally, it is unique)
      - meters[i].value (**double**) — the value in double
      - meters[i].valueInPerSec (**double**) — the average value in per second
      - meters[i].unit (**string**) — the unit of value
      - meters[i].document (**string**) — human-readable description to this meter
      - meters[i].queryTime (**Long**) — the time we query this meter from remote nodes
      - meters[i].startTime (**Long**) — the time to start this meter (not all services offer this record)
      - meters[i].lastModified (**Long**) — the time of modifying metrics


.. _rest-shabondi-list-all:

List settings of all Shabondi services
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

*GET /v0/shabondis*

Example Response
  .. code-block:: json

    [
      {
        "author": "root",
        "brokerClusterKey": {
          "group": "group0",
          "name": "bk00"
        },
        "name": "shabondi0",
        "xms": 1024,
        "routes": {},
        "state": "RUNNING",
        "lastModified": 1587100361274,
        "shabondi.client.port": 58456,
        "shabondi.source.toTopics": [
          {
            "group": "group0",
            "name": "topic0"
          }
        ],
        "tags": {},
        "xmx": 1024,
        "shabondi.class": "oharastream.ohara.shabondi.ShabondiSource",
        "nodeMetrics": {
          "node00": {
            "meters": [
              {
                "document": "The number of received rows",
                "lastModified": 1587100347637,
                "name": "total-rows",
                "queryTime": 1587100360577,
                "startTime": 1587100347637,
                "unit": "row",
                "value": 0.0,
                "valueInPerSec": 0.0
              }
            ]
          }
        },
        "imageName": "oharastream/shabondi:$|version|",
        "revision": "7cb25202c5308095546e5a6a2b96480d9d3104e1",
        "version": "$|version|",
        "aliveNodes": [
          "node00"
        ],
        "jmxPort": 56586,
        "kind": "source",
        "group": "group0",
        "nodeNames": [
          "node00"
        ]
      }
    ]


.. _rest-shabondi-create:

Create the settings of a Shabondi service
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

*POST /v0/shabondis*

Example Request
  .. code-block:: json

    {
      "name": "shabondi0",
      "group": "group0",
      "shabondi.class": "oharastream.ohara.shabondi.ShabondiSource",
      "shabondi.client.port": 58456,
      "shabondi.source.toTopics": [
        {"name": "topic0","group": "group0"}
      ],
      "brokerClusterKey": {
        "group": "group0",
        "name": "bk00"
      },
      "nodeNames": [
        "node00"
      ]
    }


Example Response
  .. code-block:: json

    {
      "author": "root",
      "brokerClusterKey": {
        "group": "group0",
        "name": "bk00"
      },
      "name": "shabondi0",
      "xms": 1024,
      "routes": {},
      "lastModified": 1587101035977,
      "shabondi.client.port": 58456,
      "shabondi.source.toTopics": [
        {
          "group": "group0",
          "name": "topic0"
        }
      ],
      "tags": {},
      "xmx": 1024,
      "shabondi.class": "oharastream.ohara.shabondi.ShabondiSource",
      "nodeMetrics": {},
      "imageName": "oharastream/shabondi:$|version|",
      "revision": "7cb25202c5308095546e5a6a2b96480d9d3104e1",
      "version": "$|version|",
      "aliveNodes": [],
      "jmxPort": 56726,
      "kind": "source",
      "group": "group0",
      "nodeNames": [
        "node00"
      ]
    }


.. _rest-shabondi-get:

Get the settings of a Shabondi service
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

*GET /v0/shabondis/${name}?group=${group}*


Example Response
  .. code-block:: json

    {
      "author": "vitojeng",
      "brokerClusterKey": {
        "group": "group0",
        "name": "bk00"
      },
      "name": "shabondi0",
      "xms": 1024,
      "routes": {},
      "lastModified": 1587101035977,
      "shabondi.client.port": 58456,
      "shabondi.source.toTopics": [
        {
          "group": "group0",
          "name": "topic0"
        }
      ],
      "tags": {},
      "xmx": 1024,
      "shabondi.class": "oharastream.ohara.shabondi.ShabondiSource",
      "nodeMetrics": {},
      "imageName": "oharastream/shabondi:$|version|",
      "revision": "7cb25202c5308095546e5a6a2b96480d9d3104e1",
      "version": "$|version|",
      "aliveNodes": [],
      "jmxPort": 56726,
      "kind": "source",
      "group": "group0",
      "nodeNames": [
        "node00"
      ]
    }


.. _rest-shabondi-update:

Update the settings of a Shabondi service
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

*PUT /v0/shabondis/${name}?group=${group}*

Example Request
  .. code-block:: json

    {
      "shabondi.client.port": 96456
    }


Example Response
  .. code-block:: json

    {
      "author": "vitojeng",
      "brokerClusterKey": {
        "group": "group0",
        "name": "bk00"
      },
      "name": "shabondi0",
      "xms": 1024,
      "routes": {},
      "lastModified": 1587106367767,
      "shabondi.client.port": 38400,
      "shabondi.source.toTopics": [
        {
          "group": "group0",
          "name": "topic0"
        }
      ],
      "tags": {},
      "xmx": 1024,
      "shabondi.class": "oharastream.ohara.shabondi.ShabondiSource",
      "nodeMetrics": {},
      "imageName": "oharastream/shabondi:$|version|",
      "revision": "7cb25202c5308095546e5a6a2b96480d9d3104e1",
      "version": "$|version|",
      "aliveNodes": [],
      "jmxPort": 56726,
      "kind": "source",
      "group": "group0",
      "nodeNames": [
        "node00"
      ]
    }


.. _rest-shabondi-delete:

Delete the settings of Shabondi
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

*DELETE /v0/shabondis/${name}?group=${group}*

Example Response
  ::

     202 Accepted

  It is ok to delete an nonexistent properties, and the response is 204 NoContent.


.. _rest-shabondi-start:

Start a Shabondi service
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

*PUT /v0/shabondis/${name}/start?group=${group}*

Example Response
  ::

    202 Accepted

  .. note::
     You should use :ref:`get shabondi <rest-shabondi-get>` to fetch up-to-date status


.. _rest-shabondi-stop:

Stop a Shabondi service
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

*PUT /v0/shabondis/${name}/stop?group=${group}*

Example Response
  ::

    202 Accepted

  .. note::
     You should use :ref:`get shabondi <rest-shabondi-get>` to fetch up-to-date status
