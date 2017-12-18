---
title: "Database Performance Tuning"
author: NOWHERE
date: '2017-10-07'
description: "This post is a note on database tuning based on my own experience."
tags: [Database Tuning]
categories: [vignettes]
permalink: /:categories/:title
---
# 1. Synopsis

This paper provides about personal perspectives and experience on practical and general database performance tuning by focusing on the actual techniques and considerations. Specifically, it will introduce basic benchmarks for database in a probable right manner and the methods which are suitable for system performance level, database itself performance level and human performance level respectively. Part of content comes from personal practices and experience, and there is also great content comes from academic literature and popular technique blogs.

# 2. Benchmarks for Database

Since people tried to quantify and test the performance of database, the so-called "benchmark for database" came out and could be used to measure the performance of database generally.

 The industry-standard, vendor and customer-application benchmarks were the major types of benchmarks (Dietrich et al. 1992).[^fn1] The industry-standard provides a broad view of the performance in the database industry and usually it will cover the commparasion among different vendors' database product. The vendor benchmark will mainly focus on their own products and to some extents vendors hope to use the benchmarks to double stimulate the evolution of their products and support their marketing sales. The customer-application benchmark is more user-owned-applicaiton focused, for example, under a certain scenario, customers care more about the concurrency and recovery control, then benchmarks of the custoemr-application benchmark of these aspects may be relatively stricter.

These three types of benchmarks seem seperated, but actually, they are not. The changes from customer-application benchmarks will somewhat affect the vendors when they design their benchmarks, and then such effects will shape the industry-standard benchmark imperceptibly, and vice versa.

Under most scenarios, to measure the performance of database is not a simple point-to-point task, in fact, it is an omnibus, which means people need to consider comprehensively, for example, how much cost people paid, how much work people did to configure the system, how much energy people spent on the maintance and so forth. When design benchmarks, the targets can refer to various aspects such as concurrency control, recovery control, data compression effectiveness, the 'think time' (a rigid time interval between two transactions) and so forth, based on people want to focus more on the transaction processing and querying or the performance of utilities of the database management system.

Take the aspect of transaction processing and querying as an example, there are several classic benchmarks such as DebitCredit, TPC-A, TPC-B, Wisconsin and SUDS. The first three are used when test update-intensice operations in banking systems, and the other two can be used to test ad hoc query processing efficiency. The common point of these benchmarks is they all focus on the resource consumption, time elapsed and the stability of the operations. The difference points can be some of them may start from differnent of dimensions and are used in different scenarios. For people, this should always be business-oriented rather than get hooked on a certain specific rules or scenarios.

# 3. Boost the Performance of Database

People always hope to tune their database system to achieve the best performance within limited resources, even their systems have reached the benchmarks set beforehand. In this section, some prractical tricks for tunning database will be introduced.

## 3.1 System Level

For DBAs, they could do limited things on system level for certain limited permission settings. However, to upgrade the performance of the database system, DBA could cooperate with system administrators and ask them contribute on the system level.

As an industry-specific slang goes, "In Linux, everything is a file" (Both, 2015).[^fn2] Meanwhile, for the "safety" perpose, linux systems set default values to part of its key features. Based on my own experience, to realize a high concurrency database service on linux systems, one important thing must be done is to modify the default number of its maximum number of allowed opened files (`fs.file-max`-- kernal level,  `soft/hard nofile` -- user level). I modified these options in one project of one previous cloud computing courses and the performance of my service was boosted significantly -- reduced 50% of latency and increase 100% of throughput per minute.

```bash
# open the sysctl.conf file
[renzhih@renzhih-ubuntu ~]$ sudo vim /etc/sysctl.conf

# Then Add "fs.file-max = 2097152" in this file
# just set a number larger than its default one
# save and leave the file

# check whether the modificaiton has made effects
[renzhih@renzhih-ubuntu ~]$ sudo sysctl -p
fs.file-max = 2097152
[renzhih@renzhih-ubuntu ~]$ cat /proc/sys/fs/file-max
2097152

# modify the limits.conf file by adding hard/soft limit about your database service, say mysql for example
# mysql hard nofile 1048576
# mysql soft nofile 1048576
[renzhih@renzhih-ubuntu ~]$ sudo vi /etc/security/limits.conf
# Add a big number to the limitNOFile, for example, say "LimitNOFILE=500000"
[renzhih@renzhih-ubuntu ~]$ sudo vi /lib/systemd/system/mysql.service

# Re-launch your database service
[renzhih@renzhih-ubuntu ~]$ sudo systemctl daemon-reload
[renzhih@renzhih-ubuntu ~]$ sudo systemctl restart mysql
```

## 3.2 Database Level

For database itself, same as the linux system, there are lots of default values could be modified in order to boost the performace of database.

Take MySQL as an example, firstly, people should choose one specific engine based on their business logics. If the table is long-term static query table, which means it will not update the content within a certain peroid, then it could use the MyISAM engine and compress the whole table to make it "smaller" and speed up the "select" action. Correspondingly, if the service will accept new values and update table, then InnoDB engine is a good choice.

To configure the parameters in the bottom layer, people could refer to the configuration file, usually it is named as `my.cnf` or `mysqld.cnf` depends on your operating systems. Similar to the `fs.file-max` on system level, MySQL also has parameters such `open-files-limits` and `innodb-open-files`. More than that, DBAs also could try to tell the database how and how many tables it should cache and how many connections it should allow for concurrent service (Combaudon, 2014).[^fn3] Moreover, for InnoDB, DBAs should assign a fair size to its buffer pool size.

*note: for detailed configuration process, please refer to the section 2 of the appendix*.

## 3.3 Human Performance Level

In this level, people act as the key factor. There are several spots are needed to be noticed, such as design a fair schema, making it be suitable for the business requirement (OLTP or OLAP), make full use of index (Cioloca and Georgescu, 2011),[^fn4] know the feature of database system and write the right queries.

When design the schema, designer need to balance the normalization and denormalization based on the actual task. If the mission is to build a data warehouse, then a star schema might be a ideal choice. However, if the designer also cares about the data integrity and storage consumption, then maybe the schema could be changed to snowflake shcemab by scarificing a certain of query speed but gain benefits on less storage space and the snowflake schema can specifically satisify a certain queries.

Meanwhile, when people hope to use the *nested loop join* in several database system such as Oracle DB and MySQL, pay attention to keep the smaller table as the driving table -- here the "smaller" table does not mean the table with fewer records, and it means the table with the fewer records which can match the filtering conditions. This trick can also be used in Hive, an data warehouse built on HDFS.

[^fn1]: Dietrich, S., Brown, M., Cortes-Rello, E. and Wunderlin, S. (1992). A Practitioner's Introduction to Database Performance Benchmarks and Measurements. The Computer Journal, 35(4), pp.322-331.

[^fn2]: Both, D. (2015) Everything is a file. Available at: https://opensource.com/life/15/9/everything-is-a-file (Accessed: 6 October 2017).

[^fn3]: Combaudon, S. (2014) Ten MySQL performance tuning settings after installation. Available at: https://www.percona.com/blog/2014/01/28/10-mysql-performance-tuning-settings-after-installation/ (Accessed: 6 October 2017)

[^fn4]: Cioloca, C., & Georgescu, M. (2011). Increasing database performance using indexes. Database Systems Journal, 2(2), 13-22.