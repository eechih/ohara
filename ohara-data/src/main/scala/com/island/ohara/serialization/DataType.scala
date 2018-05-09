package com.island.ohara.serialization

/**
  * List the supported type in default reader/writer.
  * NOTED: DON'T change the index since it is a part of serialization.
  */
sealed abstract class DataType(val index: Byte)

case object BYTES extends DataType(0)

case object BOOLEAN extends DataType(1)

case object BYTE extends DataType(2)

case object SHORT extends DataType(3)

case object INT extends DataType(4)

case object LONG extends DataType(5)

case object FLOAT extends DataType(6)

case object DOUBLE extends DataType(7)

case object STRING extends DataType(8)

object DataType {
  def all = Array(BYTES, BOOLEAN, BYTE, SHORT, INT, LONG, FLOAT, DOUBLE, STRING)

  def of(index: Byte): DataType = all.find(_.index == index).get
}
