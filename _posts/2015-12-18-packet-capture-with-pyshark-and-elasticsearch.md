---
layout: post
title:  "Packet Capture with Pyshark and Elasticsearch"
date:   2015-12-18 12:40:37
categories: Programming
tags: Elasticsearch Python Network
comments: true
feature: /assets/img/Packet_Capture_with_Pyshark_and_Elasticsearch.png
image: "/assets/img/Packet_Capture_with_Pyshark_and_Elasticsearch.png"
---
Network packet capture and analysis are commonly done with tools like *tcpdump*, *snort*, and *Wireshark*. These tools provide the capability to capture packets live from networks and store the captures in PCAP files for later analysis. A much better way to store packets is to index them in Elasticsearch where you can easily search for packets based on any combination of packet fields.

Pyshark is a module that provides a wrapper API to *tshark* – the command line version of *Wireshark* – with which you can build packet capture applications that take advantage of all the Wireshark protocol dissectors. With Pyshark and the Elasticsearch Python client library you can easily create a simple packet capture application in Python that can index packets in Elasticsearch.

## Installing in a Python Virtual Environment

I like to run my Python projects in virtual environments to keep the dependencies isolated from each other. If you want to do likewise, install *virtualenv* and *virtualenvwrapper*. The latter keeps your virtual environments in one place in your $HOME directory. Here is how you install these two utilities:

{% highlight bash %}
pip install virtualenv
pip install virtualenvwrapper
{% endhighlight %}

Next add these lines to your *.bash_profile* file:

{% highlight bash %}
if [[ -r /usr/local/bin/virtualenvwrapper.sh ]]; then
    source /usr/local/bin/virtualenvwrapper.sh
else
    echo "WARNING: Can't find virtualenvwrapper.sh"
fi
{% endhighlight %}

Finally, source your *.bash_profile* and create a virtual environment for your Pyshark code, something like **vespcap**:

{% highlight bash %}
source $HOME/.bash_profile
mkvirtualenv vespcap
{% endhighlight %}

## Install Pyshark and Elasticsearch

Let me fast forward a minute to the time when I when I wrote my first basic Pyshark application. I discovered that the latest version – 0.3.6 as of this writing – has a tendency to interrupt packet capture with the error message:

{% highlight bash %}
'NoneType' object has no attribute 'add_reader'
{% endhighlight %}

I’ve logged an issue with the Pyshark developer, but there is little he can do since it appears that trollius version 2.0 is the real culprit. Fortunately another Pyshark enthusiast found a workaround that involves using earlier versions of Pyshark and trollius.

You can easily install the modules you need with a pip requirements file. Place these lines in a file called requirements.txt, making sure you keep do not change the versions of any modules except, possibly, elasticsearch if you are using a different version of that:

{% highlight bash %}
click==6.6
elasticsearch==2.3.3
futures==3.0.5
Logbook==0.12.5
lxml==3.6.0
py==1.4.31
pyshark==0.3.5
six==1.10.0
trollius==1.0.4
urllib3==1.16
{% endhighlight %}

Assuming you are using the virtual environment you created in the previous section then run these commands:

{% highlight bash %}
mkdir espcap
cd espcap
workon vespcap
pip install -r requirements.txt
{% endhighlight %}

Place all your code in the *escpap* directory.

## Packet Capture Application

### Application Structure

The sample packet capture application that will be built during the remainder of the article contains these functions:

- `main()` – Processes command line options, starts capturing packets from a file or live from a network, and connects to Elasticsearch
- `dump_packets()` – Prints packet fields to stdout
- `index_packets()` – Indexes packets in Elasticsearch
- `list_interfaces()` – Lists the network interface names

The application will support these command line options:

- `--node` – The IP address and port of the Elasticsearch instance where the packets will be indexed.
- `--nic` – The network interface that will be used for live capture
- `--file` – The PCAP file that containing the packets that will be loaded
- `--list` – Lists the network interfaces that can be used for live capture
- `--help` – Displays a help message summarizing the application usage
To get all the necessary Python functionality, our application will of course have to import pyshark and elasticsearch modules. We’ll also us the click module to easily handle command line options:

{% highlight python %}
#!/usr/bin/env python

import sys
import click
import pyshark
from elasticsearch import Elasticsearch
from elasticsearch import helpers
{% endhighlight %}

### Main Function

The `main()` function handles command line options using click module decorators. The  `--list` option takes precedence over the others. When used it results in a call to list_interfaces(). If no input mode is specified with either `--nic` or `--file`, an error message is displayed indicating that the application requires some sort of packet input.

{% highlight python %}
@click.command()
@click.option('--node', default=None, help='Elasticsearch IP and port (default=None)')
@click.option('--nic', default=None, help='Network interface for live capture (default=None, if file specified)')
@click.option('--file', default=None, help='PCAP file for file capture (default=None, if nic specified)')
@click.option('--list', is_flag=True, help='List the network interfaces')
def main(node, nic, file, list):
    if list:
        list_interfaces()
        sys.exit(0)
    elif nic == None and file == None:
        print 'You must specify either a network interface or packet capture file'
        sys.exit(1)

    capture = None
    if nic == None:
        capture = pyshark.FileCapture(file)
    elif file == None:
        capture = pyshark.LiveCapture(nic)

    if node == None:
        dump_packets(capture)
    else:
        es = Elasticsearch(node)
        helpers.bulk(es, index_packets(capture))

if __name__ == '__main__':
    main()
{% endhighlight %}

If a packet capture file is specified, `pyshark.FileCapture()` is called to open a capture from the given PCAP file. Otherwise if a network interface (nic) is specified, `pyshark.LiveCapture()` is called to open a capture from the given network interface. Packets are processed by either displaying their contents, if no Elasticsearch cluster is specified, or indexed into Elasticsearch. The call to Elasticsearch opens a connection to an Elasticsearch instance at the given IP address and TCP port.

### List Network Interfaces

Listing the available network interfaces requires a call to tshark with the -D option. That can be handled simply with the os.popen() mechanism shown in the list_interfaces() shown below. Since this call is outside of Pyshark the path to tshark has to either be specified in the os.popen() call or in the users $PATH.

{% highlight python %}
def list_interfaces():
    proc = os.popen("tshark -D")  # Note tshark must be in $PATH
    tshark_out = proc.read()
    interfaces = tshark_out.splitlines()
    for i in range(len(interfaces)):
        interface = interfaces[i].strip(str(i+1)+".")
        print interface
{% endhighlight %}

### Processing Packets

#### Pyshark Packet Structure

Pyshark captures can be treated as a Python file objects over which you can iterate through to get and process the contents of each packet. Here are skeletons for the `dump_packets()` and `index_packets()` functions.

{% highlight python %}
def dump_packets(capture):
    for packet in capture:
        # print out some packet fields

def index_packets(capture):
    for packet in capture:
        # index some packet fields
{% endhighlight %}

Pyshark packets are JSON like objects that contain all the protocol layers. The packet shown is taken from a debugging screen in [PyCharm](https://www.jetbrains.com/pycharm/){:target="_blank"} after loading an HTTP packet trace from a PCAP file. This particular packet is an HTTP GET request.

![](/assets/img/packet.png){: .image-left-justify}

Packet layers and fields are referenced with JSON-like dot notation. For example, `packet.eth` references the Ethernet layer, `packet.ip` references the IP layer, and so on. Each protocol layer has a similar structure. The next figure hows the IP layers fields from the same HTTP GET request packet.

![](/assets/img/layers.png){: .image-left-justify}

Referencing IP layer fields just involves another level of indirection, `packet.ip.src` gets the source IP address, `packet.ip.dst` gets the destination IP address, etc. The same coding pattern can be followed get fields from other protocol layers.

One caveat of referencing packets in this manner is that Pyshark uses a different field name for IPv6 layers. If an IPv6 layer is encountered, the source IP and destination IP addresses are referenced by `packet.ipv6.src` and `packet.ipv6.dst`, respectively. So if a Pyshark application is going to get IP fields, it must first check whether the IP version is 4 or 6. This can be done by iterating though the 	`packet.layers` list checking the `_layer_name` of each layer to determine whether it is `ip` or `ipv6`. This function handles that chore.

{% highlight python %}
def get_ip_version(packet):
    for layer in packet.layers:
        if layer._layer_name == 'ip':
            return 4
        elif layer._layer_name == 'ipv6':
            return 6
{% endhighlight %}

#### Print Packet Fields

The `dump_packets()` function just prints out the source IP address, destination IP address, source TCP port, and destination TCP port of each packet. It calls the `get_ip_version()` function to determine how to access the IP layer fields.

{% highlight python %}
def dump_packets(capture):
    i = 1
    for packet in capture:
        if packet.transport_layer == 'TCP':
            ip = None
            ip_version = get_ip_version(packet)
            if ip_version == 4:
                ip = packet.ip
            elif ip_version == 6:
                ip = packet.ipv6
            print 'Packet %d' % i
            print 'Source IP        -', ip.src
            print 'Source port      -', packet.tcp.srcport
            print 'Destination IP   -', ip.dst
            print 'Destination port -', packet.tcp.dstport
            print
        i += 1
{% endhighlight %}

### Index Packet Fields

To index packets in Elasticsearch we could just index a packet at a time in the `index_packets()` for loop. That approach is not nearly as efficient as using bulk indexing to load several packets a a time.

The Elasticsearch Python client module provides helper functions that make bulk index operations easy to implement. Helper functions use generators to get documents to index. Generators are like callback functions that are invoked multiple times to get a stream of data. Instead of returning values they *yield* values to the caller. To get more detailed information about generators check out the blog [Iterables vs Iterators vs Generators](Iterables vs Iterators vs Generators).

The `index_packets()` function is the generator function that feeds packet data to the index helper function.

{% highlight python %}
def index_packets(capture):
    for packet in capture:
        if packet.transport_layer == 'TCP':
            ip = None
            ip_version = get_ip_version(packet)
            if ip_version == 4:
                ip = packet.ip
            elif ip_version == 6:
                ip = packet.ipv6
            action = {
                '_op_type': 'index',
                '_index': 'packets_lite',
                '_type': 'test',
                '_source': {
                   'srcip' : ip.src,
                   'srcport' : packet.tcp.srcport,
                   'dstip' : ip.dst,
                   'dstport' : packet.tcp.dstport
                }
            }
            yield action
{% endhighlight %}

Each time through the capture loop, `index_packets()` creates a JSON object that contains the type of bulk operation to perform, the name of the index where packets are stored, the type of the index, and finally the field names and values are placed in a JSON object named _source. Again `get_ip_version()` is called to determine how to access the IP layers fields. At the end of each loop, the action JSON object, as we’re calling it, is yielded to the caller. The helper function collects a group of packets, 1000 by default, then indexes them in Elasticsearch on the application’s behalf without the need for any additional code.

## Running the Packet Capture Application

I put all of this code together in the **escpap_lite.py** script which you can download from Github at [https://github.com/vichargrave/espcap](https://github.com/vichargrave/espcap){:target="_blank"}. Just clone the repo and cd into the *espcap/src* directory, then you can test the script with one of the test packet captures.

{% highlight bash %}
espcap_lite.py --file=../test_pcaps/test_http.pcap
{% endhighlight %}

The first few packets should look like this:

{% highlight bash %}
Source IP        - 10.0.0.4
Source port      - 59803
Destination IP   - 184.51.102.81
Destination port - 80

Source IP - 184.51.102.81
Source port - 80
Destination IP - 10.0.0.4
Destination port - 59803

Source IP - 10.0.0.4
Source port - 59803
Destination IP - 184.51.102.81
Destination port - 80
{% endhighlight %}

Next try to index the same packets in Elasticsearch. Assuming you have an Elasticsearch instance running on  your local system you can run **espcap_lite.py** like this:

{% highlight bash %}
espcap_lite.py --file=..test_pcaps/test_http.pcap --node=localhost:9200
{% endhighlight %}

You can check to see if the packets were indexed by running this `curl` command:

{% highlight bash %}
curl localhost:9200/packets_lite/_search?pretty
{% endhighlight %}

The first few packets in Elasticsearch should look like this:

{% highlight bash %}
"hits" : {
    "total" : 1268,
    "max_score" : 1.0,
    "hits" : [ {
      "_index" : "packets_lite",
      "_type" : "test",
      "_id" : "AVG4ivJ41fAfZ6k0uaNv",
      "_score" : 1.0,
      "_source":{"srcip": "10.0.0.4", "dstip": "184.51.102.81", "srcport": "59803", "dstport": "80"}
    }, {
      "_index" : "packets_lite",
      "_type" : "test",
      "_id" : "AVG4ivJ41fAfZ6k0uaNw",
      "_score" : 1.0,
      "_source":{"srcip": "184.51.102.81", "dstip": "10.0.0.4", "srcport": "80", "dstport": "59803"}
    },
{% endhighlight %}

## Espcap – A More Complete Example

The **espcap.git** repo contains a more complete packet capture example espcap.py, This script probes each captured more deeply and stores all the protocol layers. Using the dissector support provided by tshark, **espcap.py** has the capability to index the fields of most application protocols as well as those in the TCP stack. You can read more about it on the **Espcap** [README](https://github.com/vichargrave/espcap/blob/master/README.md){:target="_blank"} file.
