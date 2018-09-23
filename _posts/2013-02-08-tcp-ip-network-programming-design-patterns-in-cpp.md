---
layout: post
title:  "TCP/IP Network Programming Design Pattens in C++"
date:   2013-02-08 12:40:37
categories: Programming
tags: C/C++ Network Sockets
comments: true
feature: /assets/img/TCPIP_Network_Programming_Design_Pattens_in_C++.png
image: "/assets/img/TCPIP_Network_Programming_Design_Pattens_in_C++.png"
---
Network programming with the BSD Sockets API involves making a series of boilerplate calls to several operating system level functions every time you want to create connections and transfer data over TCP/IP networks. This process can be both cumbersome and error prone.

Fortunately there is an easier way to develop network applications. By thinking in terms of design patterns, we can devise abstractions for creating connections and transferring data between network peers that encapsulate socket calls in easy to use C++ classes.

## Network Programming Basics

### Internet Model

Before launching into the design patterns, let’s go over some basics of network programming with BSD Sockets.

The Internet model is a subset of the Open Systems Interconect (OSI) model that describes how network protocols and equipment should interoperate. The mapping of the Internet stack layers to the OSI model is illustrated below.

![](/assets/img/Network-Stack-Models1.png){: .image-left-justify}

The Internet application layer combines the application, presentation and session layers of the OSI model. It’s in this layer where the Internet protocols – HTTP, SSH, DNS, etc. –  are implemented that directly interact with Internet applications.

At the bottom of the OSI stack is the datalink and physical layers which map to a single Network Link layer in the Internet model. Network drivers are implemented here that provide the Network layer with the means to send packets over physical network media such as Ethernet, PPP and ADSL.

The Network and Transport layers are the same across both models. The Network layer in the Internet model provides connectionless Internet protocol packet delivery, host IP addresses and routing hosts and other networks. The ICMP, ARP and DHCP are implemented in the Network layer on top of IP.

Both TCP and UDP protocols live in the transport layer and add the concept of ports to differentiate applications running on a given host. TCP provides connection based, reliable network communication and stream based data delivery services. Reliability is achieved through retransmission of dropped packets. UDP provides connectionless and packet based delivery where the data is delivered in datagrams  – packets with port numbers. UDP, like IP, gives only best effort data delivery without retransmissions of dropped packets.

BSD Sockets is an API to the transport layer of the Internet Protocol Stack. It supports creating both TCP and UDP network I/O.

### Socket Workflow

To establish TCP connections the server host calls `socket()` to create a listening socket then specifies the IP address and TCP port on which the server will receive connection requests with a call to `bind()`. Calling `listen()` puts the server into listening mode which then blocks on the `accept()` waiting for incoming connections.

![](/assets/img/Socket-Workflow.png){: .image-left-justify}

The client connects to the server by calling `socket()` then `connect()` with a socket address that includes the IP address and TCP port specifying used for the bind() call on the server. On the server the `accept()` function returns with a connection socket descriptor when the client’s connection request is received.

After connecting the server blocks on a call to `read()` waiting for a client request. The client calls `write()` to send a request then blocks on a call to `read()` waiting for the server’s response. When the server is done processing the request, it sends back a response to the client. The exchange of requests and responses repeats until the client is done, at which time it closes the connection. The server detects this event when `read()` returns `0`. The server responds by closing its end of the connection then returning to get another connection.

In most servers connections are accepted in one thread and a new thread or process is created to handle each connection. To keep things simple the example here describes an iterative server where each request is handled one at a time.

## Network Programming Patterns

The key to designing an object-oriented network programming API is to recognize that TCP/IP network programs involve three basic pattens of usage or behaviors: actively connecting to servers, passively accepting connections from clients and transferring data between network peers – in other words clients and servers.  Each behavior suggests a distinct abstraction that can be implemented in a separate class.

`TCPConnector` - Encapsulates the socket mechanisms to actively connect to a server. This is a factory class which produces TCPStream objects when client applications establish connections with servers.
`TCPAcceptor` - Encapsulates the socket mechanisms to passively accept connections from a client. This is also a factory class which produces TCPStream objects when server applications establish connections with clients
`TCPStream` - Provides network I/O mechanisms and returns IP address and TCP port of peer applications.

For the code examples in this blog, each of these classes has an include file (.h) and source file (.cpp) of the same name. For example, *tcpconnector.h* and *tcpconnector.cpp* for the `TCPConnector` class.

## TCPStream Class

### Interface

The `TCPStream` class provides methods to send and receive data over a TCP/IP connection. It contains a connected socket descriptor and information about the peer – either client or server – in the form of the IP address and TCP port. `TCPStream` includes simple get methods that return address and port, but not the socket descriptor which is kept private. One of the advantages of programming with objects is the ability to logically group data members and methods to avoid exposing data, in this case the socket descriptor, to the calling program that it does not need to see.  Each connection is completely encapsulated in each `TCPStream` object.

`TCPStream` objects are created by `TCPConnector` and `TCPAcceptor` objects only, so the `TCPStream` constructors must be declared private to prevent them from being called directly by any other objects. The `TCPStream` class grants friend privileges to the `TCPConnector` and `TCPAcceptor` classes so they can access the `TCPStream` constructors to supply connected socket descriptors.

{% highlight c++ %}
#include <sys/types.h>
#include <sys/socket.h>
#include <unistd.h>
#include <string>

using namespace std

class TCPStream
{
    int     m_sd;
    string  m_peerIP;
    int     m_peerPort;

  public:
    friend class TCPAcceptor;
    friend class TCPConnector;

    ~TCPStream();

    ssize_t send(char* buffer, size_t len);
    ssize_t receive(char* buffer, size_t len);

    string getPeerIP();
    int getPeerPort();

  private:
    TCPStream(int sd, struct sockaddr_in* address);
    TCPStream();
    TCPStream(const TCPStream& stream);
};
{% endhighlight %}

### Constructor

The constructor stores the connected socket descriptor then converts the socket information structure fields to a peer IP address string and peer TCP port. These parameters can be inspected with calls to `TCPStream::getPeerIP()` and `TCPStream::getPeerPort()`.

{% highlight c++ %}
#include <arpa/inet.h>
#include "tcpstream.h"

TCPStream::TCPStream(int sd, struct sockaddr_in* address) : msd(sd) {
    char ip[50];
    inet_ntop(PF_INET, (struct in_addr*)&(address->sin_addr.s_addr),
              ip, sizeof(ip)-1);
    m_peerIP = ip;
    m_peerPort = ntohs(address->sin_port);
}
{% endhighlight %}

### Destructor

The destructor simply closes the connection.

{% highlight c++ %}
TCPStream::~TCPStream()
{
    close(m_sd);
}
{% endhighlight %}

### Network I/O Methods

`TCPStream::send()` and `TCPStream::receive()` simply wrap calls to `read()` and `write()`, returning the number of bytes sent and bytes received, respectively. No additional buffering or other capabilities are added.

### Get Peer Information

`TCPStream::getPeerIP()` and `TCPStream::getPeerPort()` return the IP address and TCP port information of the peer to which the network application, client or server, are connected. You can get the same information from the sockets `getpeername()` function but it far easier to just capture that information when the connections are established. Clients know in advance to where they are connecting and the client’s socket address is returned the `accept()` function when the server accepts a client connection – see the `TCPAcceptor::accept()` method definition. In both cases the socket address information is passed to the `TCPStream` object when it is constructed.

## TCPConnector Class

### Interface

`TCPConnector` provides the `connect()` method to actively establish a connection with a server. It accepts the server port and a string containing the server host name or IP address. If successful, a pointer to a `TCPStream` object is returned to the caller.

{% highlight c++ %}
#include <netinet/in.h>
#include "tcpstream.h"

class TCPConnector
{
  public:
    TCPStream* connect(int port, const char* server);

  private:
    int resolveHost(const char* host, struct in_addr* addr);
};
{% endhighlight %}

### Constructor/Destructor

The `TCPConnector` class does not use any member variables so the default constructor and destructor generated by the C++ compiler are fine. No others are defined.

### Connect to Server

{% highlight c++ linenos %}
#include <string.h>
#include <netdb.h>
#include <arpa/inet.h>
#include "tcpconnector.h"

TCPStream* TCPConnector::connect(const char* server, int port)
{
    struct sockaddr_in address;

    memset (&address, 0, sizeof(address));
    address.sin_family = AF_INET;
    address.sin_port = htons(port);
    if (resolveHostName(server, &(address.sin_addr)) != 0) {
        inet_pton(PF_INET, server, &(address.sin_addr));
    }
    int sd = socket(AF_INET, SOCK_STREAM, 0);
    if (::connect(sd, (struct sockaddr*)&address, sizeof(address)) != 0) {
        return NULL;
    }
    return new TCPStream(sd, &address);
}
{% endhighlight %}

**[Lines 6-12]** `TCPConnector::connect()` call takes a server host name or IP address string and the server listening port as arguments. The server `struct sockaddr_in sin_family` is set to `PF_INET` and the `sin_port` is set to the TCP port on which the server is listening for connections.

**[Lines 13-15]** `TCPConnector::resolveHost()` to convert the DNS host name string to an IP address. If this call fails the assumption is made the server string contains an IP address and it is converted to an IP address in network byte order.

**[Lines 16]** The first argument to `socket()` selects the protocol family and the second specifies the nature of the network communication. Together `PF_INET` and `SOCK_STREAM` mandate the TCP/IP protocol.

**[Lines 17-20]** We call `::connect()` passing it the socket descriptor, pointer to the server `struct sockaddr_in` structure, cast to a `struct sockaddr` pointer, and the length of the server address structure. The `::connect()` call is prefeced with the `::` qualifier so the compiler does not confuse this function with `TCPConnector::connect()`.  If `::connect()`  succeeds a `TCPStream` object is created with the connected socket descriptor and the server socket address information and a pointer to the `TCPStream` object is returned to the caller.

### Resolve Host Name

`TCPConnector::resolveHostName()` converts a DNS host name to an IP address in network byte order by calling `getaddrinfo()`. This function was chosen over `gethostbyname()` since it is thread safe whereas `gethostbyname()` is not. If the host name is not a valid DNS name, i.e. it is an IP address string or something else, `-1` is returned, otherwise `0` is returned.

{% highlight c++ %}
int TCPConnector::resolveHostName(const char* hostname, struct in_addr* addr)
{
    struct addrinfo *res;

    int result = getaddrinfo (hostname, NULL, NULL, &res);
    if (result == 0) {
        memcpy(addr, &((struct sockaddr_in *) res->ai_addr)->sin_addr,
               sizeof(struct in_addr));
        freeaddrinfo(res);
    }
    return result;
}
{% endhighlight %}

## TCPAcceptor Class

### Interface

`TCPAcceptor` includes member variables for the listening socket descriptor, the socket address information – IP address and TCP port – and a flag that indicates whether or not the TCPAcceptor has started listening for connections.

Two public methods are supported. One to start the listening and the other to accept connections.

{% highlight c++ %}
#include <string>
#include <netinet/in.h>
#include "tcpstream.h"

using namespace std;

class TCPAcceptor
{
    int    m_lsd;
    string m_address;
    int    m_port;
    bool   m_listening;

  public:
    TCPAcceptor(int port, const char* address="");
    ~TCPAcceptor();

    int        start();
    TCPStream* accept();

  private:
    TCPAcceptor() {}
};
{% endhighlight %}

### Constructor

The constructor sets the member variables to as shown here. Setting `m_lsd` indicates that the listening socket has not been created.

{% highlight c++ %}
#include <stdio.h>
#include <string.h>
#include <arpa/inet.h>
#include "tcpacceptor.h"

TCPAcceptor::TCPAcceptor(int port, const char* address)
    : m_lsd(0), m_port(port), m_address(address), m_listening(false) {}
{% endhighlight %}

### Destructor

If the listening socket has been created then it is closed in the destructor.

{% highlight c++ %}
TCPAcceptor::~TCPAcceptor()
{
    if (m_lsd > 0) {
        close(m_lsd);
    }
}
{% endhighlight %}

### Start Listening for Connections

{% highlight c++ linenos %}
int TCPAcceptor::start()
{
    if (m_listening == true) {
        return 0;
    }

    m_lsd = socket(PF_INET, SOCK_STREAM, 0);

    struct sockaddr_in address;
    memset(&address, 0, sizeof(address));
    address.sin_family = PF_INET;
    address.sin_port = htons(m_port);
    if (m_address.size() > 0) {
        inet_pton(PF_INET, m_address.c_str(), &(address.sin_addr));
    }
    else {
        address.sin_addr.s_addr = INADDR_ANY;
    }

    int optval = 1;
    setsockopt(m_lsd, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof optval);

    int result = bind(m_lsd, (struct sockaddr*)&address, sizeof(address));
    if (result != 0) {
        perror("bind() failed");
        return result;
    }
    result = listen(m_lsd, 5);
    if (result != 0) {
        perror("listen() failed");
        return result;
    }
    m_listening = true;
    return result;
}
{% endhighlight %}

**[Line 3-5]** Creating a listening socket involves the most socket calls of any operation. Before going through the series of calls, `TCPAcceptor::start()` checks to see if a listening socket already exists. If so, the method just returns 0.

**[Line 7]** First we create a listening socket descriptor for TCP/IP. The `socket()` call for servers is the same as it is for clients.

**[Lines 9-12]** Next we initialize a  socket address structure setting the protocol family `PF_INET` and the listening TCP port.

**[Lines 13-18]** If the server listening IP address has `m_address` has been set, `inet_ntop()`  is called to convert it to a numerical IP address in network byte order. If `inet_ntop()` fails then the socket listening address is set to any IP address meaning the server will listening for connections on all the network interfaces.

**[Lines 20-21]** Normally when you stop a server listening on a given IP address and port, it takes a few seconds before you can starting listening on the same IP address and port when you restart your server. To disable this condition and make it possible to immediately resue a listening port, we set the `SO_REUSEADDR` socket option for the listening socket before calling `bind()`.

**[Lines 23-27]** Bind the listening socket address to the socket descriptor. If `bind()` fails display and error message then return value returned by `bind()`.

**[Lines 28-34]** Turn on server listening with the `listen()` function. The second argument of this function sets the number of connection requests TCP will queue. This may not be supported for your particular operating system. If `listen()` fails, display an error message. Otherwise, set the `m_listening` flag to true and return the `listen()` call return value

### Accept Connections from Clients

{% highlight c++ linenos %}
TCPStream* TCPAcceptor::accept()
{
    if (m_listening == false) {
        return NULL;
    }

    struct sockaddr_in address;
    socklen_t len = sizeof(address);
    memset(&address, 0, sizeof(address));
    int sd = ::accept(m_lsd, (struct sockaddr*)&address, &len);
    if (sd < 0) {
        perror("accept() failed");
        return NULL;
    }
    return new TCPStream(sd, &address);
}
{% endhighlight %}

**[Lines 3-10]** `TCPAcceptor::accept()` returns NULL if the socket is not in a listening state. Otherwise a `sockaddr_in` structure is set to `NULL` and a pointer to it, cast as a `sockaddr` structure, is passed to `::accept()`. The `::accept()` call is qualified by the `::` operator so the compiler does not confuse this function with the `TCPAcceptor::accept()`. The `::accept()` blocks until a connections is received.

**[Lines 11-15]** When a connection with a client is established, the socket address structure is populated with the client’s socket information and `::accept()` returns `0`. Then a pointer to a `TCPStream` object is returned to the caller.

## Test Applications

### Echo Server

First let’s build a server with the `TCPAcceptor` class. To keep things simple we’ll just make an iterative server that handles one connection at a time. The server will be defined in the file *server.cpp*.

{% highlight c++ linenos %}
#include <stdio.h>
#include <stdlib.h>
#include "tcpacceptor.h"

int main(int argc, char** argv)
{
    if (argc < 2 || argc > 4) {
        printf("usage: server <port> [<ip>]\n");
        exit(1);
    }

    TCPStream* stream = NULL;
    TCPAcceptor* acceptor = NULL;
    if (argc == 3) {
        acceptor = new TCPAcceptor(atoi(argv[1]), argv[2]);
    }
    else {
        acceptor = new TCPAcceptor(atoi(argv[1]));
    }
    if (acceptor->start() == 0) {
        while (1) {
            stream = acceptor->accept();
            if (stream != NULL) {
                size_t len;
                char line[256];
                while ((len = stream->receive(line, sizeof(line))) > 0) {
                    line[len] = NULL;
                    printf("received - %s\n", line);
                    stream->send(line, len);
                }
                delete stream;
            }
        }
    }
    perror("Could not start the server");
    exit(-1);
}
{% endhighlight %}

**[Lines 5-10]** The server accepts the listening TCP port and optionally the listening IP Address on the command line. If the number of arguments is not correct an error message is displayed informing the user how to correctly invoke the application.

**[Lines 12-20]** The `TCPAcceptor` object is created with the command line arguments. Minimally the IP address must be specified.  Then the server starts listening for connections.

**[Lines 21-32]** If the call to `TCPAcceptor::start()` is successful, the server continually and indefinitely accepts connections from clients and processes each connection one at a time. Processing consists of getting a string of bytes from the client, displaying the string and returning it to the client. The string of bytes is `NULL` terminated at the index in the receive buffer equal to the value returned by the receive operation. This is repeated until the client closes the connection indicated by a return value of `0` from `TCPStream::receive()`. Deleting the stream object closes the connection on the server side.

### Echo Client

The client application takes the server TCP port and IP address on the command line.  For each connection a string is displayed and sent to the server, the echoed string is received back and displayed, then the connection is closed. The client will be defined in the file *client.cpp*.

{% highlight c++ %}
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include "tcpconnector.h"

using namespace std;

int main(int argc, char** argv)
{
    if (argc != 3) {
        printf("usage: %s <port> <ip>\n", argv[0]);
        exit(1);
    }

    int len;
    string message;
    char line[256];
    TCPConnector* connector = new TCPConnector();
    TCPStream* stream = connector->connect(argv[2], atoi(argv[1]));
    if (stream) {
        message = "Is there life on Mars?";
        stream->send(message.c_str(), message.size());
        printf("sent - %s\n", message.c_str());
        len = stream->receive(line, sizeof(line));
        line[len] = NULL;
        printf("received - %s\n", line);
        delete stream;
    }

    stream = connector->connect(argv[2], atoi(argv[1]));
    if (stream) {
        message = "Why is there air?";
        stream->send(message.c_str(), message.size());
        printf("sent - %s\n", message.c_str());
        len = stream->receive(line, sizeof(line));
        line[len] = NULL;
        printf("received - %s\n", line);
        delete stream;
    }
    exit(0);
}
{% endhighlight %}

### Build and Run

You can get the source code for the project from Github – [https://github.com/vichargrave/tcpsockets.git](https://github.com/vichargrave/tcpsockets.git){:target="_blank"}. Create the test apps by running make. You can build the client and server separately by running:

{% highlight bash %}
$ make -f Makefile.client
$ make -f Makefile.server
{% endhighlight %}

First run the server on port `9999` and `localhost` in a terminal window:

{% highlight bash %}
$ server 9999 localhost
{% endhighlight %}

In another terminal window run the client and you should get the following output:

{% highlight bash %}
$ client 9999 localhost
sent - Is there life on Mars?
received - Is there life on Mars?
sent - Why is there air?
received - Why is there air?
{% endhighlight %}

The server output should look like this:

{% highlight bash %}
received - Is there life on Mars?
received - Why is there air?
{% endhighlight %}
