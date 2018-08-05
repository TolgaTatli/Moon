---
layout: post
title:  "Improved OSSEC Log Parsing with Logstash"
date:   2014-08-19 12:40:37
categories: Tutorials
tags: Elasticsearch Logstash OSSEC
comments: true
feature: /assets/img/Improved_OSSEC_Log_Parsing_with_Logstash.png
image: "/assets/img/Improved_OSSEC_Log_Parsing_with_Logstash.png"
---
The ELK stack (Elasticsearch-Logstash-Kibana) provides a cost effective alternative to commercial SIEMs for ingesting and managing OSSEC alert logs. Previously I wrote a blog – [OSSEC Log Management with Elasticsearch](/ossec-log-management-with-elasticsearch){:target="_blank"} – that discusses the design of an ELK based log system.

Since then some readers have asked for and suggested ways to parse additional fields from the OSSEC alert log stream. For example, the IP addresses of systems that cause certain security events is buried down in the Details field. So I have created a Logstash configuration file that does just that.

## Logstash Configuration for Alert Details

The log management system I described previously gets alerts from the OSSEC server via syslog (UDP) to Logstash which, in turn, parses the alerts and forwards them to an Elasticsearch instance for indexing. When OSSEC outputs alerts over syslog they are flattened into single lines and certain field names are altered over their alert log counterparts.

Here is an example of an alert log entry that is generated when an attempt to login to a system with SSH fails, followed by the corresponding syslog alert line.

{% highlight text %}
** Alert 1408299218.5566: - syslog,sshd,invalid_login,authentication_failed,
2014 Aug 17 11:13:38 localhost->/var/log/secure
Rule: 5710 (level 5) -> 'Attempt to login using a non-existent user'
Src IP: 10.0.0.3
Aug 17 11:13:38 localhost sshd[3029]: Failed none for invalid user vic from 10.0.0.3 port 8400 ssh2

Aug 17 11:13:38 ossec ossec: Alert Level: 5; Rule: 5710 - Attempt to login using a non-existent user; Location: localhost->/var/log/secure; srcip: 10.0.0.3; Aug 17 11:13:38 localhost sshd[3029]: Failed none for invalid user vic from 10.0.0.3 port 8400 ssh2
{% endhighlight %}

Note that the `Src IP` field in the alert log is called srcip in the syslog output. There are several other fields like this – another one is `Dst IP` the name of which is dstip in the syslog output – that appear in other OSSEC alerts.

To parse syslog lines like this, I’ve taken the Logstash configuration file from my previous blog then added some additional field parsing directives to tease out more fields from the `Details` field.

{% highlight ruby %}
input {
# stdin{}
  udp {
     port => 9000
     type => "syslog"
  }
}

filter {
  if [type] == "syslog" {
    grok {
      match => { "message" => "%{SYSLOGTIMESTAMP:syslog_timestamp} %{SYSLOGHOST:syslog_host} %{DATA:syslog_program}: Alert Level: %{NONNEGINT:Alert_Level}; Rule: %{NONNEGINT:Rule} - %{DATA:Description}; Location: %{DATA:Location}; (user: %{USER:User};%{SPACE})?(srcip: %{IP:Src_IP};%{SPACE})?(user: %{USER:User};%{SPACE})?(dstip: %{IP:Dst_IP};%{SPACE})?(src_port: %{NONNEGINT:Src_Port};%{SPACE})?(dst_port: %{NONNEGINT:Dst_Port};%{SPACE})?%{GREEDYDATA:Details}" }
      add_field => [ "ossec_server", "%{host}" ]
    }
    mutate {
      remove_field => [ "message","syslog_timestamp", "syslog_program", "syslog_host", "syslog_message", "syslog_pid", "@version", "type", "host" ]
    }
  }
}

output {
#   stdout {
#     codec => rubydebug
#   }
   elasticsearch_http {
     host => "10.0.0.1"
   }
}
{% endhighlight %}

Optional fields can be handled with Logstash by placing them in a `()?` block as I did with this part of the message `grok`:

{% highlight text %}
(user: %{USER:User};%{SPACE})?(srcip: %{IP:Src_IP};%{SPACE})?(user: %{USER:User};%{SPACE})?(dstip: %{IP:Dst_IP};%{SPACE})?(src_port: %{NONNEGINT:Src_Port};%{SPACE})?(dst_port: %{NONNEGINT:Dst_Port};%{SPACE})?
{% endhighlight %}

With this line, if any of the fields `user`, `srcip`, `dstip`, `src_port`, or `dst_port` appear in the syslog output, each will be parsed and placed into a Logstash output field. Note you should replace the IP address in the host field to direct the Logstash output to your Elasticsearch cluster.
