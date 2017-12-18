---
title: "Basic Intro about Hadoop and Its Eco-system"
author: "NOWHERE"
description: "A video talks about the hadoop and its eco-system."
date: "2017-08-26"
tags: [MapReduce, Hadoop, HDFS, Hive]
categories: [talks]
permalink: /:categories/:title
---
<iframe width="560" height="315" src="https://www.youtube.com/embed/OoEpfb6yga8" frameborder="0" allowfullscreen></iframe>

In this video, the lecturer from Hortonworks gave an brief intro about Hadoop and its main eco-system.

Hadoop has two core parts:

* MapReduce: the computation/processing part of hadoop
  * MapReduce Server == TaskTracker: is responsible for launch MapReduce tasks on machines

* HDFS: the data storage part of hadoop
  * HDFS Server == DataNode: keep the blocks of data on the machines

Many single machine with hadoop can form up hadoop clusters:

* JobTracker == SUM(TaskTrackers): keeps track of jobs being run; receives user jobs and divides and assigns jobs to each tasktracker, and tasktrackers will execute tasks and do health checking
* NameNode == SUM(DataNode): keeps information on data location


Also, the lecture mentioned about the roles of Pig, Hive, HBase, Zookeeper, Mahout, Ambari, Ganglia, Nagios, Sqoop, Cascading, Oozie, Flume, Protobuf, Avro, Thrift and Fuse-DFS.

For Hive, it's more like an API for people who are more familiar with SQL to interact with Hadoop and use the advantage of MapReduce and HDFS.
