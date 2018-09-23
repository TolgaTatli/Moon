---
layout: post
title:  "TCP/IP Sockets with Time Out Capabilities"
date:   2014-03-27 12:40:37
categories: Programming
tags: C/C++ Network Sockets
comments: true
feature: /assets/img/TCPIP_Sockets_with_Time_Out_Capabilities.png
image: "/assets/img/TCPIP_Sockets_with_Time_Out_Capabilities.png"
---
Recently I had a question from one of my readers about how to close connections on a server when there are no requests received after a certain period of time.  The question was asked with regard to the `tcpsockets` classes I covered in my blog [TCP Network Programming Design Patterns in C++](/tcp-ip-network-programming-design-patterns-in-cpp){:target="_blank"}, none of which support time out capabilities.

Timing out on both receive and connect operations are common use cases. So in this article I’ll update my tcpsockets classes to provide these capabilities.

## Receive Time Outs

### Updated TCPStream Header

To handle receive time outs, I’ve added the private `waitForReadEvent()` – line 26 below – method to the `TCPStream` class which is called by the `receive()` method. The receive time out is specified with an additional time out argument that contains the desired time out in seconds – line 14 below. Setting the time out argument to `0` in the header indicates that this is an optional parameter and if not supplied by the caller, the value of `0` will be used. As you’ll see later, a time out of `0` means that the receive operation will call `waitForReadEvent()`.

{% highlight c++ linenos %}
class TCPStream
{
    int     m_sd;
    string  m_peerIP;
    int     m_peerPort;

  public:
    friend class TCPAcceptor;
    friend class TCPConnector;

    ~TCPStream();

    ssize_t send(const char* buffer, size_t len);
    ssize_t receive(char* buffer, size_t len, int timeout=0);

    string getPeerIP();
    int    getPeerPort();

    enum {
        connectionClosed = 0,
        connectionReset = -1,
        connectionTimedOut = -2
    };

  private:
    bool waitForReadEvent(int timeout);

    TCPStream(int sd, struct sockaddr_in* address);
    TCPStream();
    TCPStream(const TCPStream& stream);
};
{% endhighlight %}

**[Lines 20-22]** Define TCPStream class specific values that correspond to three connection results, closure, reset or other error and time out. The connectionTimeOut value is used in the `receive()` method.

### Updated TCPStream Class

The `select()` system call enables programs to detect when data is available to receive and whether connections have completed on one ore more sockets. The function can also set limits for the amount time that they will wait for either type of network event to be detected. The `waitForReadEvent()` method encapsulates the `select()` functionality.

{% highlight c++ linenos %}
bool TCPStream::waitForReadEvent(int timeout)
{
    fd_set sdset;
    struct timeval tv;

    tv.tv_sec = timeout;
    tv.tv_usec = 0;
    FD_ZERO(&sdset);
    FD_SET(m_sd, &sdset);
    if (select(m_sd+1, &sdset, NULL, NULL, &tv) > 0) {
        return true;
    }
    return false;
}
{% endhighlight %}

**[Lines 1-4]** `waitForReadEvent()` accepts a connected socket descriptor as an argument. The `select()` function uses fd_set structures to determine which sockets to monitor for read events and a `timeval` structure to set the amount of time it will wait to detect read events.

**[Lines 6-9]** The `tv_sec` field is set to the specified time out in seconds and the `tv_usec` – milliseconds field – is set to `0`. The `fd_set` structure contains a bit for each possible socket descriptor. Initially, all the bits are set to zero – with `FD_ZERO()` – then the bit corresponding to the socket to be monitored is set using `FD_SET()`.

**[Lines 10-13]** The first argument of `select()` is the value of the largest socket descriptor plus `1`, in this case the connected socket descriptor plus 1. Note that `select()` will only look for events on this socket descriptor since all the descriptors less than this one are set to zero with `FD_ZERO()`. The next three arguments are pointers to `fd_set` structures corresponding to sockets that will be monitored for receive, send and out-of-band network events. Only read events on the given socket descriptor will be monitored – the first `fd_set` pointer – so the remaining two are set to `NULL`. The last argument is a pointer the `timeval` structure. `select()` waits the number of seconds specified by the `tv_se`c value to detect incoming data on the connect socket. If data arrives in that time frame, it returns a value greater than `1`. Otherwise it will return `0` if none was detected or `-1` if there was an error. `waitForReadEvent()` returns true if a receive event is detected or `false` if not.

{% highlight c++ linenos %}
ssize_t TCPStream::receive(char* buffer, size_t len, int timeout)
{
    if (timeout <= 0) return read(m_sd, buffer, len);

    if (waitForReadEvent(timeout) == true) {
        return read(m_sd, buffer, len);
    }
    return connectionTimedOut;
}
{% endhighlight %}

**[Lines 1-3]** If the time out passed to `tcpstream::receive()` is `0`, this disables time out and a blocking call to `read()` is made.

**[Lines 5-8]** Otherwise `waitForEvent()` is called for the connected socket descriptor with the specified time out in seconds. If true is returned then `read()` is called otherwise `connectionTimeOut` is returned.

## Connect Time Outs

### Updated TCPConnector Header

To handle connection time outs, I’ve added another `connect()` method to the `TCPConnector` class – line 5 below – that accepts a time out value in seconds.

{% highlight c++ linenos %}
class TCPConnector
{
  public:
    TCPStream* connect(const char* server, int port);
    TCPStream* connect(const char* server, int port, int timeout);

  private:
    int resolveHostName(const char* host, struct in_addr* addr);
};
{% endhighlight %}

### Updated TCPConnector Class

Once again the `select() f`unction is used to implement connect time outs. Instead of monitoring read events though, `select()` is called to check when a socket becomes writable which indicates that a connection has been established.

{% highlight c++ linenos %}
TCPStream* TCPConnector::connect(const char* server, int port, int timeout)
{
    if (timeout == 0) return connect(server, port);

    struct sockaddr_in address;

    memset (&address, 0, sizeof(address));
    address.sin_family = AF_INET;
    address.sin_port = htons(port);
    if (resolveHostName(server, &(address.sin_addr)) != 0 ) {
        inet_pton(PF_INET, server, &(address.sin_addr));        
    }     

    long arg;
    fd_set sdset;
    struct timeval tv;
    socklen_t len;
    int result = -1, valopt, sd = socket(AF_INET, SOCK_STREAM, 0);

    // Set socket to non-blocking
    arg = fcntl(sd, F_GETFL, NULL);
    arg |= O_NONBLOCK;
    fcntl(sd, F_SETFL, arg);

    // Connect with time limit
    string message;
    if ((result = ::connect(sd, (struct sockaddr *)&address, sizeof(address))) < 0)
    {
        if (errno == EINPROGRESS)
        {
            tv.tv_sec = timeout;
            tv.tv_usec = 0;
            FD_ZERO(&sdset);
            FD_SET(sd, &sdset);
            if (select(sd+1, NULL, &sdset, NULL, &tv) > 0)
            {
                len = sizeof(int);
                getsockopt(sd, SOL_SOCKET, SO_ERROR, (void*)(&valopt), &len);
                if (valopt) {
                    fprintf(stderr, "connect() error %d - %s\n", valopt, strerror(valopt));
                }
                // connection established
                else result = 0;
            }
            else fprintf(stderr, "connect() timed out\n");
        }
        else fprintf(stderr, "connect() error %d - %s\n", errno, strerror(errno));
    }

    // Return socket to blocking mode
    arg = fcntl(sd, F_GETFL, NULL);
    arg &= (~O_NONBLOCK);
    fcntl(sd, F_SETFL, arg);

    // Create stream object if connected
    if (result == -1) return NULL;
    return new TCPStream(sd, &address);
}
{% endhighlight %}

**[Lines 1-3]** If the time out is set to 0 then the original `tcpconnector::connect()` method is called that does not enforce a time out.

**[Lines 5-12]** Otherwise proceed with the current method by setting up the server socket address structure.

**[Lines 14-18]** Define the local variables that will be used for the connection process and create a TCP stream socket. The connection result variable is set to `-1` be default and can be set to another value pending the outcome to the `connect()` call.

**[Lines 21-20]** Before calling `connect()`, the socket descriptor must be set to non-blocking so the function will start the connecting to the server – which involves the three-way SYN-ACK handshake – but will not wait for the process to complete unless the connection can be established instantaneously. To do this the `fcntl()` function is called with the `F_GETFL` flag to get the control flags for the socket descriptor. Next we set the blocking/non-blocking mode  flag to non_blocking with an OR of the bit and the `O_NONBLOCK` mask, then call `fcntl()` with this flag set and  the `F_SETFL` to put the socket into non-blocking mode.

**[Lines 26-29]** If the `connect()` call for the non-blocking socket returns `0`, then the connection has been established. Otherwise check the errno global variable to see if the three-way handshake is underway which is indicated by a value of `EIN_PROGRESS`.

**[Lines 31-35]** If the connection is proceeding, set the time out by initializing the timeval structure and set the socket descriptor bit for an fd_set structure in the same manner as `tcpstream::waitForReadEvent()`. Also call `select()` as before except the `fd_set` address argument will be applied to the second `fd_set` pointer argument so the function will wait for the socket to become writable which happens when the connection is established or there is an error on the socket.

**[Lines 37-43]** If `select()` returns `1` after the time out period elapses, then check to see if this is due to an error or the socket has become writable. If a call to `getsockopt()` for the socket descriptor with the `SOL_SOCKET` and `SOL_ERROR` argument sets the valopt field to a non-zero value, then the socket encountered an error and the connection failed. Otherwise, the connection was successfully established and the result variable is set to `0` indicating success.

**[Line 45]** If `select()` returns `0` after the time out period elapses, then the connection time out.

**[Line 47]** If `connect()` returns `-1` and `errno` is not set to `EIN_INPROGRESS` then the connection failed.

**[Lines 51-53]** Return the socket to blocking mode by calling `fcntl()` function with the `F_GETFL` flag to get the control flags for the socket descriptor. Next set the blocking/non-blocking mode control flag to blocking with an AND of the bit and the compliment of the `O_NONBLOCK` mask – which sets the flag to `0` – then call `fcntl()` with this flag zeroed and  the `F_SETFL` to put the socket into blocking mode.

**[Lines 56-57]** If any error during connection occurred return `NULL` otherwise return a `TCPStream` object for the socket.

## Test Applications

### Server For Connect Time Outs

To test connect time outs, I created a server that creates a listening socket, binds to an IP address and port but does not start listening for connections. This creates a situation where the client can send TCP SYN packets to the server, but the server never returns any ACKs. This causes the client TCP to retry sending SYNs then eventually time out.

{% highlight c++ %}
#include <stdio.h>
#include <string.h>
#include <arpa/inet.h>
#include <stdlib.h>
#include "tcpacceptor.h"

int main(int argc, char** argv)
{
    int lsd = socket(PF_INET, SOCK_STREAM, 0);
    struct sockaddr_in address;

    memset(&address, 0, sizeof(address));
    address.sin_family = PF_INET;
    address.sin_port = htons(atoi(argv[1]));
    address.sin_addr.s_addr = INADDR_ANY;

    int optval = 1;
    setsockopt(lsd, SOL_SOCKET, SO_REUSEADDR, &optval, sizeof optval);

    int result = bind(lsd, (struct sockaddr*)&address, sizeof(address));
    if (result != 0) {
        perror("bind() failed");
        return result;
    }
    pause();

    return 0;
}
{% endhighlight %}

### Server For Receive Time Outs

To test receive time outs, I created a server that listens for connections on a given IP address and TCP port, establishes connections with clients and receives requests but never sends any replies. This causes the client to time out waiting for a reply that never arrives.

{% highlight c++ %}
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
                ssize_t len;
                char line[256];
                while ((len = stream->receive(line, sizeof(line))) > 0);
                printf("connection closed\n");
                delete stream;
            }
        }
    }
    exit(0);
}
{%endhighlight %}

### Client That Tests Connect and Receive Time Outs

Finally I created a client that tests both connect and receive time outs. It is designed to send a message to the server then wait for a specified time out interval.

{% highlight c++ %}
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include "tcpconnector.h"

using namespace std;

int main(int argc, char** argv)
{
    if (argc != 5) {
        printf("usage: %s <pause port> <time out port> <ip> <time out>\n", argv[0]);
        exit(1);
    }

    int result, timeout = atoi(argv[4]);
    string message;
    char line[256];

    printf("Connecting to the paused server...\n");
    TCPConnector* connector = new TCPConnector();
    TCPStream* stream = connector->connect(argv[3], atoi(argv[1]), timeout);
    if (stream == NULL) {
        printf("Timed out connecting to the server\n");
    }

    printf("Connecting to the time out server...\n");
    stream = connector->connect(argv[3], atoi(argv[2]), timeout);
    if (stream) {
        message = "Is there life on Mars?";
        stream->send(message.c_str(), message.size());
        printf("sent - %s\n", message.c_str());
        result = stream->receive(line, sizeof(line), timeout);
        if (result == TCPStream::connectionTimedOut) {
            printf("Timed out waiting for a server response\n");
        }
        delete stream;
    }

    exit(0);
}
{% endhighlight %}

### Get the Code and Run the Tests

You can the project code from Github – [https://github.com/vichargrave/tcpsockets](https://github.com/vichargrave/tcpsockets){:target="_blank"}. Build the project by running make in the tcpsockets directory. Then run the test servers and test client like this with a time out of 2 seconds, assuming you are running everything on the same system:

{% highlight bash %}
$ server_pause 9998 & server_timeout 9999 &
client_timeout 9998 9999 localhost 2
{% endhighlight %}

You should get the following output:

{% highlight bash %}
Connecting to the paused server...
connect() timed out
Timed out connecting to the server
Connecting to the time out server...
sent - Is there life on Mars?
Timed out waiting for a server response
connection closed
{% endhighlight %}
