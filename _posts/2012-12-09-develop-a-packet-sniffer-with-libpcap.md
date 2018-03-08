---
layout: post
title:  "Develop a Packet Sniffer with Libpcap"
date:   2012-12-09 12:40:37
categories: Programming
tags: C/C++ Libpcap Network
comments: true
feature: /assets/img/Develop_a_Packet_Sniffer_with_Libpcap.png
image: "/assets/img/Develop_a_Packet_Sniffer_with_Libpcap.png"
---
Libpcap is an open source C library that provides an API for capturing packets directly from the datalink layer of Unix derived operating systems. It is used by popular packet capture applications such as tcpdump and snort that enables them to run on just about any flavor of Unix.

Here’s an example of a simple packet sniffer application based on libpcap that displays packet information in a snort-like format.

<!--more-->

### Libpcap Installation

Chances are if you use an open source UNIX derived operating system like Linux or FreeBSD libcpap was most likely included with your distribution along with tcpdump. If you do not have libpcap you can download it from www.tcpdump.org. To install follow these instructions:

1. Run `tar -zxvf libpcap.tar.gz` to unpack the libpcap tarball.
2. cd to the resulting local libpcap directory.
3. Run `./configure` to create the make environment.
4. Run make to build the libpcap library in the local directory.
5. Edit the resulting *Makefile* to set the prefix variable to the path where you want to install the libpcap files.
6. `su` to root.
7. Run `make install` to copy the libpcap library, header and man pages to the installation directory set in step 5

### Program Structure

#### Header Files and Global Variables

The code for the packet sniffer will reside in a single file `sniffer.c` that starts off with the include files shown below. All libpcap programs require the pcap.h header file to gain access to library functions and constants. The netinet and arpa headers provide data structures that simplify the task of accessing protocol specific header fields. ANSI and UNIX standard headers are included so the program can display packet contents and handle program termination signals.

{% highlight c %}
#include <pcap.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys socket.h>
#include <netinet in.h>
#include <arpa inet.h>
#include <netinet ip.h>
#include <netinet tcp.h>
#include <netinet udp.h>
#include <netinet ip_icmp.h>

pcap_t* pd;
int linkhdrlen;{% endhighlight %}

There are two global variables we will use in the sniffer, the libpcap descriptor and the link header size.  The `pcap` socket descritpor is a `pcap_t` pointer to a structure identifies the packet capture channel and is used in all the libpcap function calls.  The link header size will be used during packet capture and parsing to skip over the datalink layer header to get to the IP header of each packet.

#### Main Function

The goal of the example packet sniffer application is to collect raw IP packets traversing a network so that we can inspect their header and payload fields to determine protocol type, source address, destination address and so on. Let’s take a look at the `main()` function for the program:

{% highlight c %}
int main(int argc, char **argv)
[
    char interface[256] = "", bpfstr[256] = "";
    int packets = 0, c, i;

    // Get the command line options, if any
    while ((c = getopt (argc, argv, "hi:n:")) != -1)
    {
        switch (c)
        {
        case 'h':
            printf("usage: %s [-h] [-i ] [-n ] []\n", argv[0]);
            exit(0);
            break;
        case 'i':
            strcpy(interface, optarg);
            break;
        case 'n':
            packets = atoi(optarg);
            break;
        }
    }

    // Get the packet capture filter expression, if any.
    for (i = optind; i < argc; i++)
    {
        strcat(bpfstr, argv[i]);
        strcat(bpfstr, " ");
    }

    // Open libpcap, set the program termination signals then start
    // processing packets.
    if ((pd = open_pcap_socket(interface, bpfstr)))
    {
        signal(SIGINT, bailout);
        signal(SIGTERM, bailout);
        signal(SIGQUIT, bailout);
        capture_loop(pd, packets, (pcap_handler)parse_packet);
        bailout(0);
    }
    exit(0);
}
{% endhighlight %}

#### Top Level Functions

The `main()` function processes the command line arguments then relies on the following 4 functions to do the work:

- `open_pcap_socket()` – opens a network interface (or device in libpcap lingo) to receive packets described by a packet capture filter.
- `capture_loop()` – captures a specified number of packets on a network device calling a user supplied function to process each packet.
- `parse_packet()` – all back function that will parse and display TCP, UDP and ICMP packet contents.
- `bailout()` – function that is called by signal handlers and display the packet capture statistics.

The packet sniffer supports the following program options

- `-i` specifies the network interface to use for packet capture, by default libpcap looks one up.
- `-n` specifies the total number of packets to capture, by default packets are captured indefinitely.
- `-h` causes the program to display a program usage reminder.

All other string arguments are presumed to be parts of a packet filter statement and are combined into a single string. If no packet filter parameters are entered then all IP packets are captured.

### Open a Packet Capture Socket

#### Open Socket Function

In UNIX system programming jargon a **socket** is an endpoint for network communication that is identified in a program with a **socket descriptor**. Although these terms more commonly refer to transport layer endpoints capable of bidirectional communication, we will use them in this document to refer to endpoints for packet capture at the datalink layer.

Opening a packet capture socket involves a series of libpcap calls that are encapsulated in the `open_pcap_socket()` function:

{% highlight c linenos %}
pcap_t* open_pcap_socket(char* device, const char* bpfstr)
{
    char errbuf[PCAP_ERRBUF_SIZE];
    pcap_t* pd;
    uint32_t  srcip, netmask;
    struct bpf_program  bpf;

    // If no network interface (device) is specfied, get the first one.
    if (!*device && !(device = pcap_lookupdev(errbuf)))
    {
        printf("pcap_lookupdev(): %s\n", errbuf);
        return NULL;
    }

    // Open the device for live capture, as opposed to reading a packet
    // capture file.
    if ((pd = pcap_open_live(device, BUFSIZ, 1, 0, errbuf)) == NULL)
    {
        printf("pcap_open_live(): %s\n", errbuf);
        return NULL;
    }

    // Get network device source IP address and netmask.
    if (pcap_lookupnet(device, &srcip, &amp;netmask, errbuf) < 0)
    {
        printf("pcap_lookupnet: %s\n", errbuf);
        return NULL;
    }

    // Convert the packet filter epxression into a packet
    // filter binary.
    if (pcap_compile(pd, &bpf, (char*)bpfstr, 0, netmask))
    {
        printf("pcap_compile(): %s\n", pcap_geterr(pd));
        return NULL;
    }

    // Assign the packet filter to the given libpcap socket.
    if (pcap_setfilter(pd, &bpf) < 0)
    {
        printf("pcap_setfilter(): %s\n", pcap_geterr(pd));
        return NULL;
    }

    return pd;
}
{% endhighlight %}

#### Select a Network Device

**[Lines 9-13]** Network interfaces, or devices, are denoted by unique character strings referred to as network devices in the libpcap man page. For instance under Linux, Ethernet devices have the general form **ethN** where `N` == `0`, `1`, `2`, and so on depending on how many network interfaces a system contains. The first argument to `open_pcap_socket()` is the device string obtained from the program command line. If no device is specified `pcap_lookupdev()` is called to select a device, usually the first one that it finds.

#### Open a Network Device for Live Capture

**[Lines 17-21]** `pcap_open_live()` opens the selected network device for packet capture and returns a libpcap socket descriptor, if successful. The term **live** refers to the fact that packets will be read from an active network as opposed to a file containing packet data that were previously saved. The first argument to this function is the network device we want to use for packet capture, the second sets the maximum size of each packet that will be received, the third toggles promiscuous mode, the fourth sets a time out (if supported by the underlying OS) and the last is a pointer to an error message buffer. Promiscuous mode enables us to capture packets sent between any host on our network not just those that are sent to and from our system. However if our system resides on a packet switched network, enabling promiscuous mode has no effect since we will only see packets with our IP address due to the MAC address routing performed by the switch.

#### Get the Network Address and Subnet Mask

**[Lines 24-28]** `pcap_lookupnet()` returns the network address and subnet mask for the packet capture socket. We will need the subnet mask in order to compile the packet filter string. The last argument to this function is a pointer to an error message buffer.

#### Compile a Packet Capture Filter

Network traffic is analogous to radio broadcasts. Packets carrying a variety of protocol data are continually traversing busy networks just as radio waves are constantly transmitted into the atmosphere. To listen to a radio station you have to tune in to the transmission frequency of the desired station while ignoring all other frequencies. With libpcap you *tune in* to the packets you want to capture by describing the attributes of the desired packets in C like statments called packet filters. Here are some filters examples and what packets they tell libpcap to grab:

- `tcp` – TCP packets
- `tcp and src 128.218.1.38` – *TCP* packets with source address == *128.218.1.38*
- `udp and dst 22.334.23.1` –  *UDP* packets with destination address == *22.334.23.1*
- `udp and src 214.234.23.56 and port 53` – *DNS* packets with source address == *214.234.23.56*
- `tcp and port 80` – *HTTP* packets
- `icmp[0] == 0 or icmp[0] == 8` – *ICMP* Echo packets

**[Lines 32-36]** `pcap_compile()` converts the packet filter string argument of `open_pcap_live()` to a filter program that libcap can interpret. The first argument to `pcap_compile()` is the libpcap socket descriptor, the second is a pointer to the packet filter string, the third is a pointer to an empty libpcap filter program structure, the fourth is an unused parameter we set to 0 and the last is a 32 bit pointer to the subnet mask we obtained with `pcap_lookupnet()`. From here on libpcap functions return `0` if successful and `-1` on error. In the latter case we can use `pcap_geterr()` to return a message describing the most recent error.

#### Set the Packet Filter

**[Lines 39-43]** `pcap_setfilter()` installs the compiled packet filter program into our packet capture device. This causes libpcap to start collecting the packets that we selected with the filter.

**[Line 45]** Return a valid socket descriptor If everything is successful up to this point a valid libpcap socket descriptor is returned to the main program otherwise NULL is returned at any of the previous steps.

### Packet Capture Loop

#### Capture Loop Function

Libpcap provides 3 functions to capture packets: `pcap_next()`, `pcap_dispatch()`, and `pcap_loop()`. The first function grabs 1 packet at a time so the programmer must call it in a loop to receive multiple packets. The other 2 loop automatically to receive multiple packets and call a user supplied call back function to process each one. For our packet sniffer we will use `pcap_loop()` and wrap the call to this function in `capture_loop()`:

{% highlight c linenos %}
void capture_loop(pcap_t* pd, int packets, pcap_handler func)
{
    int linktype;

    // Determine the datalink layer type.
    if ((linktype = pcap_datalink(pd)) < 0)
    {
        printf("pcap_datalink(): %s\n", pcap_geterr(pd));
        return;
    }

    // Set the datalink layer header size.
    switch (linktype)
    {
    case DLT_NULL:
        linkhdrlen = 4;
        break;

    case DLT_EN10MB:
        linkhdrlen = 14;
        break;

    case DLT_SLIP:
    case DLT_PPP:
        linkhdrlen = 24;
        break;

    default:
        printf("Unsupported datalink (%d)\n", linktype);
        return;
    }

    // Start capturing packets.
    if (pcap_loop(pd, packets, func, 0) < 0)
        printf("pcap_loop failed: %s\n", pcap_geterr(pd));
}
{% endhighlight %}

#### Determine the Datalink Type

**[Lines 6-10]** Packets that are captured at the datalink layer are completely raw in the sense that they include the headers applied by all the network stack layers, including the datalink header, nothing is hidden from us. In our example packet sniffer we are only interested in IP packet data so we want to skip over the datalink header contained in each packet. `pcap_datalink()` helps us do this by returning a number corresponding to the datalink type associated with the packet capture socket.

**[Lines 13-31]** Given the datalink type we save the corresponding datalink header size in the linkhdrlen global variable for use later when we parse IP packets. The datalink types we support include `loopback` (`DLT_NULL`), `Ethernet` (`DLT_EN10MB`), `SLIP` (`DLT_SLIP`) and `PPP` (`DLT_PPP`). If our datalink is not one of these we simply fail and return.

#### Start Packet Capture

**[Lines 34-35]** `pcap_loop()` sets the packet count and installs our call back function.

### Parse and Display Packets

#### Parsing Function

The general technique for parsing packets is to set a character pointer to the beginning of the packet buffer then advance this pointer to a particlular protocol header by the size in bytes of the headers that precede it in the packet. The header can then be mapped to a IP, TCP, UDP and ICMP header structure by casting the character pointer to a protocol specific structure pointer. From there any protocol header field can be referenced directly though the protocol structure pointer. This techniques is used in the packet capture call back function:

{% highlight c linenos %}
void parse_packet(u_char *user, struct pcap_pkthdr *packethdr,
                  u_char *packetptr)
{
    struct ip* iphdr;
    struct icmphdr* icmphdr;
    struct tcphdr* tcphdr;
    struct udphdr* udphdr;
    char iphdrInfo[256], srcip[256], dstip[256];
    unsigned short id, seq;

    // Skip the datalink layer header and get the IP header fields.
    packetptr += linkhdrlen;
    iphdr = (struct ip*)packetptr;
    strcpy(srcip, inet_ntoa(iphdr->ip_src));
    strcpy(dstip, inet_ntoa(iphdr->ip_dst));
    sprintf(iphdrInfo, "ID:%d TOS:0x%x, TTL:%d IpLen:%d DgLen:%d",
            ntohs(iphdr->ip_id), iphdr->ip_tos, iphdr->ip_ttl,
            4*iphdr->ip_hl, ntohs(iphdr->ip_len));

    // Advance to the transport layer header then parse and display
    // the fields based on the type of hearder: tcp, udp or icmp.
    packetptr += 4*iphdr->ip_hl;
    switch (iphdr->ip_p)
    {
    case IPPROTO_TCP:
        tcphdr = (struct tcphdr*)packetptr;
        printf("TCP  %s:%d -> %s:%d\n", srcip, ntohs(tcphdr->source),
               dstip, ntohs(tcphdr->dest));
        printf("%s\n", iphdrInfo);
        printf("%c%c%c%c%c%c Seq: 0x%x Ack: 0x%x Win: 0x%x TcpLen: %d\n",
               (tcphdr->urg ? 'U' : '*'),
               (tcphdr->ack ? 'A' : '*'),
               (tcphdr->psh ? 'P' : '*'),
               (tcphdr->rst ? 'R' : '*'),
               (tcphdr->syn ? 'S' : '*'),
               (tcphdr->fin ? 'F' : '*'),
               ntohl(tcphdr->seq), ntohl(tcphdr->ack_seq),
               ntohs(tcphdr->window), 4*tcphdr->doff);
        break;

    case IPPROTO_UDP:
        udphdr = (struct udphdr*)packetptr;
        printf("UDP  %s:%d -> %s:%d\n", srcip, ntohs(udphdr->source),
               dstip, ntohs(udphdr->dest));
        printf("%s\n", iphdrInfo);
        break;

    case IPPROTO_ICMP:
        icmphdr = (struct icmphdr*)packetptr;
        printf("ICMP %s -> %s\n", srcip, dstip);
        printf("%s\n", iphdrInfo);
        memcpy(&id, (u_char*)icmphdr+4, 2);
        memcpy(&seq, (u_char*)icmphdr+6, 2);
        printf("Type:%d Code:%d ID:%d Seq:%d\n", icmphdr->type, icmphdr->code,
               ntohs(id), ntohs(seq));
        break;
    }
    printf(
        "+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n\n");
}
{% endhighlight %}

#### Define Protocol Specific Pointers

**[Lines 4-7]** `parse_packet()` starts off by defining pointers to IP, TCP, UDP and ICMP header structures. Character buffers are included for storing header fields that will be displayed to stdout.

#### IP Header Parsing

**[Lines 12-22]** The packet pointer is advanced past the datalink header by the number of bytes corresponding to the datalink type determined in `capture_loop()`. This puts the pointer at the beginning of the IP header where we cast it to a struct ip pointer so we can readily extract the packet id, time to live, IP header length and total IP packet length (including header). These values are placed into a single character buffer for display later. Since 2 and 4 byte header fields for all Internet protocols are in big endian format for we use `ntohs()` and `ntohl()` to correct the byte ordering on little endian systems. Then we advance the packet pointer past the IP header so that it points to the IP payload. Lastly we determine the protocol of the payload and switch to a section of code designed to handle that protocol.

#### TCP and UDP Header Parsing

**[Lines 25-46]** Casting the packet pointer to `struct tcphdr` and `struct udphdr` pointers gives us access to TCP and UDP header fields respectively. In both cases the source IP address and port are displayed with an arrow pointing to the destination IP address and port. In addition we will display the TCP segment flags, sequence and acknowledgment numbers, window advertisement and TCP segment length.

#### ICMP Header Parsing

**[Lines 48-56]** The `struct icmphdr` pointer enables us to display ICMP packet type and code along with the source and destination IP addresses.

### Program Termination

The `SIGINT`, `SIGTERM` and `SIGQUIT` interrupt signals are set to call the function `bailout()` which displays the packet count, closes the packet capture socket then exits the program. The call to `pcap_stats()` fills a `pcap_stats` structure that contains fields indicating how many incoming and outgoing packets were captures and how many incoming packets were dropped. The call to `pcap_close()` closed the packet capture socket.

{% highlight c %}
void bailout(int signo)
{
    struct pcap_stat stats;

    if (pcap_stats(pd, &stats) >= 0)
    {
        printf("%d packets received\n", stats.ps_recv);
        printf("%d packets dropped\n\n", stats.ps_drop);
    }
    pcap_close(pd);
    exit(0);
}
{% endhighlight %}

### Build and Run the Sniffer

You can get the source code for the project from Github – [https://github.com/vichargrave/sniffer.git](https://github.com/vichargrave/sniffer.git){:target="_blank"}. To build it just cd into the project directory and type make.

To test the sniffer application, let’s get all the traffic between the local system and Google. First we load a filter into sniffer that looks for any TCP packets with a source or destination port of 80. Note we need to run sniffer as root, Then we open a browser to [http://www.google.com](http://www.google.com){:target="_blank"}. The output should something like the following. As you can see my browser client – `192.168.1.105` – first starts the connection by going through the TCP handshaking by exchaning SYN and ACK packets. Then data transfer follows as evidenced by the PSH packets.

{% highlight bash %}
$ sudo ./sniffer tcp port 80
TCP  192.168.1.105:56326 -> 83.145.197.2:80
ID:55492 TOS:0x0, TTL:64 IpLen:20 DgLen:60
****S* Seq: 0x68be5abd Ack: 0x0 Win: 0x3908 TcpLen: 40
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

TCP  192.168.1.105:56329 -> 83.145.197.2:80
ID:30751 TOS:0x0, TTL:64 IpLen:20 DgLen:60
****S* Seq: 0x430bfb46 Ack: 0x0 Win: 0x3908 TcpLen: 40
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

TCP  83.145.197.2:80 -> 192.168.1.105:56326
ID:0 TOS:0x20, TTL:42 IpLen:20 DgLen:60
*A**S* Seq: 0xef8ca0d8 Ack: 0x68be5abe Win: 0x16a0 TcpLen: 40
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

TCP  192.168.1.105:56326 -> 83.145.197.2:80
ID:55493 TOS:0x0, TTL:64 IpLen:20 DgLen:52
*A**** Seq: 0x68be5abe Ack: 0xef8ca0d9 Win: 0x73 TcpLen: 32
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

TCP  192.168.1.105:56326 -> 83.145.197.2:80
ID:55494 TOS:0x0, TTL:64 IpLen:20 DgLen:774
*AP*** Seq: 0x68be5abe Ack: 0xef8ca0d9 Win: 0x73 TcpLen: 32
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

TCP  83.145.197.2:80 -> 192.168.1.105:56329
ID:0 TOS:0x20, TTL:42 IpLen:20 DgLen:60
*A**S* Seq: 0xefdcfe52 Ack: 0x430bfb47 Win: 0x16a0 TcpLen: 40
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

TCP  192.168.1.105:56329 -> 83.145.197.2:80
ID:30752 TOS:0x0, TTL:64 IpLen:20 DgLen:52
*A**** Seq: 0x430bfb47 Ack: 0xefdcfe53 Win: 0x73 TcpLen: 32
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

TCP  83.145.197.2:80 -> 192.168.1.105:56326
ID:503 TOS:0x20, TTL:42 IpLen:20 DgLen:52
*A**** Seq: 0xef8ca0d9 Ack: 0x68be5d90 Win: 0x39 TcpLen: 32
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
{% endhighlight %}
