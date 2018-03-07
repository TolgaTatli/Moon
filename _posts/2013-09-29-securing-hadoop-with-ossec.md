---
layout: post
title:  "Securing Hadoop with OSSEC"
date:   2013-09-28 12:40:37
categories: Security
tags: Elasticsearch OSSEC
comments: true
feature: /assets/img/Securing_Hadoop_with_OSSEC.png
---
Hadoop has built-in security facilities such as kerberos user authentication, encrypted RPC between system nodes and file encryption. While these are important features, Hadoop clusters can benefit from host intrusion detection to round out the security picture.

That’s where a system like OSSEC comes in. Find out how I’ve applied OSSEC to monitor and detect security events in Hadoop and HBase clusters.

<!--more-->

### OSSEC in a Nutshell

OSSEC is a popular host-based intrusion detection system (HIDS) that is an open source project owned and sponsored by Trend Micro. The OSSEC customer list includes the likes of such high profile companies as NetFlix, Samsung, Apple, Barnes & Noble, NASA and others who use OSSEC to monitor system logs, do file integrity checks, look for rootkits, check for registry changes (on Windows systems) and take actions based on security events that are detected.

OSSEC operates as an agent-server system. Agents handle monitoring logs, files and (Windows) registries then sending back relevant logs in encrypted form to the OSSEC server over UDP port 1514 (default port). On the server the logs are parsed with decoders and interpreted with rules that generate security alerts found in the log stream. OSSEC comes with a rich set of decoders and rules to track important system events, such as file changes, root logins, and much more. Users can add custom decoders and rules to monitor any files and generate alerts specific to their needs.

![](/assets/img/ossec-in-action.png){: .image-left-justify}

The alerts are written to the alerts.log file where they can be picked up by other systems for archiving and analysis. OSSEC also provides the capability to send logs over syslog connections to SIEMs. For more on that see the section of this blog on Visualizing Hadoop Security Events.

### OSSEC for Hadoop

The key to adapting OSSEC for Hadoop is specifying the security events that are you interested in seeing and finding the logs that produce the relevant security information. For our cluster I started out trying to look for these events:

- **Logins to nodes** – Who is logging into the Hadoop system for any reason?
- **Failed HDFS operations** – Who is trying to do things in the Hadoop - Distributed Files System (HDFS) they are not permitted to do?
- **HBase logins** – Of those logging in who are using HBase?
- **HBase REST requests** – HBase supports a REST API. Here I’m interested in tracking what are the incoming REST requests.
- **Kerberos ticket granting** – Kerberos is not a facility that comes with Hadoop nor is it required to use, but most cluster employ Kerberos for user and node authentication. As a result it makes sense to get alerts when users are granted tickets.

Since the first event is handled by OSSEC out of the box, I’ll take the second event as an example.

Hadoop clusters use HDFS namenodes to keep a directory tree of all the files stored in the datanodes and maintain a record of where data is stored. All requests to do anything with the HDFS file system goes though the namenodes. As a result, the namenode logs are where you want to look for events related to HDFS, as shown in the diagram below. The *HA* refers to *high availability* namenodes. Hadoop 2.x versions and greater support namenode failover where one namenode takes over for the other if it fails. I’ve also included the kerberos server log file as one that I want to keep and eye on to I’ve also included the kerberos server log file as one that I
want to monitor ticket granting.

![](/assets/img/hadoop-logs1.png){: .image-left-justify}

Configuring OSSEC to monitor and generate alerts for these logs is essentially a four step process:

1. Configure ossec.conf on the OSSEC agents
    - **Add files to check for changes** – For our cluster that was the Hadoop config files and system jar files which are located in */etc*, */usr/bin* and */usr/sbin*. OSSEC always does file integrity checks for all the files within these directories.
    - **Add logs to monitor and parse**.
2. Configure decoders and rules on the OSSEC server.
    - Add decoders to the *local_decoders.xml* file to parse logs and decode fields.
    - Add rules to *local_rules.xml* that generate alerts according to contents of decoded fields.
3. Test decoders and rules using OSSEC log tester application.
4. Repeat steps 1 – 4 to fix issues,

Let’s take a look at some of the XML code I use to generate failed HDFS operations alerts. If you are not interested in these details skip this and go to the section on **Visualizing Hadoop Security Events**.

To monitor the Hadoop namenode log I added the following lines to the agent ossec.conf so the namenode agent knows to look at that log file and to find it. Replace `<host>` with the hostname of the namenode in question:

{% highlight xml %}
<localfile>
    <log_format>syslog</log_format>
    <location>/var/log/hadoop-hdfs/hadoop-hdfs-namenode-<host>.log</location>
</localfile>
{% endhighlight %}

Next I created the decoders to isolate the HDFS failure messages in the namenode log files. First I configured the agent to look for text in log lines that contain `org.apache.hadoop` by adding this XML code to the *local_decoders.xml* file on the OSSEC server.

{% highlight xml %}
<decoder name="hadoop">
    <prematch>org.apache.hadoop</prematch>
</decoder>
{% endhighlight %}

To separate out the HDFS user operation log lines, I added the following decoder to local_decoders.xml – in the server ossec.conf – to look for the text `org.apache.hadoop.security.UserGroupInformation`. The decoder contains a regular expression to parse the log line and decode the fields in which I’m interested.

{% highlight xml %}
<decoder name="hdfs-auth-fail">
    <parent>hadoop</parent>
    <prematch>org.apache.hadoop.security.UserGroupInformation: </prematch>
    <regex>\S+ (\S+) as: (\S+) \S+ \S+ (\S+ \w+): \.+  
    </regex>
    <order>extra_data,user,status</order>
</decoder>
{% endhighlight %}

Detailed explanation of OSSEC regular expressions is beyond the scope of this blog. In short the regex statement in this decoder places each `(\S+)` – indicating a repeating sequence of non-space characters – into the fields `extra_data`, `user` and `status`.

Finally I added the following rule to the *local_rules.xml* file on the OSSEC server to generate an alert when an HDFS user permission violation is detected.

{% highlight xml %}
<group name="hadoop">
    <rule id="700000" level="0">
        <decoded_as>hadoop</decoded_as>
        <description>Hadoop alert rules</description>
    </rule>

    <rule id="700002" level="10">
        <if_sid>700000</if_sid>
        <match>PriviledgedActionException</match>
        <description>HDFS user permission denied</description>
    </rule>
</group>
{% endhighlight %}

The first rule provides a genral grouping of Hadoop rules. The second looks for the text `PrivilegedActionException` in any of the decoded fields. If the text is found, the OSSEC server generated the alert `HDFS user permission denied`.

The process for creating decoders and rules for HBase and Kerberos is very similar to what I’ve shown you here. For HBase you want to monitor the *hbase-hbase-master-<host>.log* file and for Kerkeros *krb5kdc.log* file.

### Visualizing Hadoop Security Events

The most basic way to see OSSEC alerts is to continually tail the alerts log file. This works for testing but is pretty cumbersome in practice. OSSEC provide a simple WebUI that provides an alert console and enables you to track the files that have changed in your cluster, but lacks the capability to do any searching on alerts nor provides any dashboards to show security event trending.

The better way to go is to send OSSEC alerts to a 3rd party SIEM or data visualization system like Splunk. For our cluster I use an open source application called Splunk for OSSEC to search and visualize alerts. Here is a screenshot of our Splunk console where I looked for any alerts that contain `hbase` or `ERROR`. The first result retuned shows the OSSEC alert that wasn’t generated when I tried to create a subdirectory in and HDFS directory for which I did not have write permission.

![](/assets/img/splunk-search.png){: .image-left-justify}

The other two events are an HBase login alert and the Kerberos ticket granting request associated with the HBase login.

Splunk also has the capability to scan historical log data and plot security trends, In this example I pulled up the main OSSEC dashboard to get a high level summary of the events that were detected in our Hadoop/HBase cluster.

![](/assets/img/splunk-trends1.png){: .image-left-justify}

### Summing Up

OSSEC provides an excellent complement to the existing Hadoop and HBase security features. It helps you monitor security logs and check file integrity so you can get visibility into the security goings on of your system or cluster.

I’ve really just scratched the surface of what’s possible with securing Hadoop with OSSEC. I did not discuss the decoder and rules I have defined for HBase. There’s also more work to be done to improve the coverage of Hadoop and HBase security events as well as extend the OSSEC system to monitor other Hadoop facilities such as Pig.

If you are interested in learning more about OSSEC, or better yet using it, visit the [OSSEC Project website](https://ossec.github.io){:target="_blank"}.
