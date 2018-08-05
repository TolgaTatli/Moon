---
layout: post
title:  "Multithreaded Work Queue Based Server in C++"
date:   2013-03-04 12:40:37
categories: Programming
tags: C/C++ Threads
comments: true
feature: /assets/img/Multithreaded_Work_Queue_Based_Server_in_C++.png
image: "/assets/img/Multithreaded_Work_Queue_Based_Server_in_C++.png"
---
Creating a multithreaded TCP/IP protocol based server requires the capabilities to handle network communication, multithreading and transferring data between threads.

I have described how to build C++ components to handle this functionality in previous blogs. This time I’ll show you how to combine these components to create a simple multithreaded server.

## Background Articles

The core server functionality that I’ll use in this project come from source code presented in the following previous articles of mine. Note you can get the source code for the articles on Github.

- Network I/O – [TCP/IP Network Programming Design Patterns in C++](/tcp-ip-network-programming-design-patterns-in-cpp){:target="_blank"}
- Multithreading – [Java Style Thread Class in C++](/java-style-thread-class-in-cpp){:target="_blank"}
- Inter-thread data transfer – [Multithreaded Work Queue in C++](/multithreaded-work-queue-in-cpp){:target="_blank"}

## Server Structure

### Producer-Consumer Model

The server is based on the producer-consumer multithreaded model I discussed in [Multithreaded Work Queue in C++](/articles/2013-01/multithreaded-work-queue-in-cpp){:target="_blank"}, where a single producer thread passes work items to 1 or more consumer threads via a work queue, implemented with the wqueue class. Threads will be created using the Thread class discussed in [Java Style Thread Class in C++](/articles/2012-12/java-style-thread-class-in-cpp){:target="_blank"}.

In the case of the TCP/IP server, the producer thread accepts connections then queues the connections for the consumer threads which in turn handle the connection processing as shown in this diagram.

![](/assets/img/TCPIP-Clients-and-Server.png){: .image-left-justify}

### Producer Thread

The producer thread in the server is implemented in the `main()` function. It’s job is to create the work queue and consumer threads then accept connections from clients and pass the connections off to the consumer threads to handle. Specifically, the producer thread takes the following actions:

1. Create a work queue object.
2. Create the consumer threads.
3. Start listening for connections from clients.
4. Wait to accept a connections from a client using a `TCPAcceptor` object – discussed in the [TCP/IP Network Programming Design Patterns in C++](/articles/2013-02/tcp-ip-network-programming-design-patterns-in-cpp){:target="_blank"} blog.
5. For each connection create a work item that transfers the connected socket – contained in a `TCPStream` object – to a consumer thread to handle the connection.
6. Return to step 4.

### Consumer Thread

The consumer threads are the workers that do the protocol session handling for the server. Each consumer thread handles a connection in the following manner:

1.Wait for a work item to be added to the queue.
2. Remove a work item from the queue.
3. Extract the TCPStream object from the work item.
4. Wait to receive a request from the client.
5. Process the request when it is received.
6. Send the reply back to the client.
7. Repeat steps 4 – 6 until the client closes the connection.
8. Close the server end of the connection when the client closes the connection.
9. Delete the work item.
10. Return to step 1.

### Work Queue

The `wqueue` class supports the methods to add and remove work items. It encapsulates a Standard C++ list object along with the Pthread functions to serialize access to the work items and enable the producer thread to signal each consumer thread when items are added to the queue.

## Server Application

### WorkItem Class

The server code for the project resides in a single file *server.cpp*. It starts off with the headers files and the definition of the WorkItem class.

{% highlight c++ %}
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include "thread.h"
#include "wqueue.h"
#include "tcpacceptor.h"

class WorkItem
{
    TCPStream* m_stream;

  public:
    WorkItem(TCPStream* stream) : m_stream(stream) {}
    ~WorkItem() { delete m_stream; }

    TCPStream* getStream() { return m_stream; }
};
{% endhighlight %}

The constructor accepts a `TCPStream` object pointer which can be accessed through a call to the `WorkItem::getStream()` method. When the `WorkItem` object is deleted it closes the connection by deleting the `TCPStream` object.

### ConnectionHandler Class – Consumer Thread

The consumer threads are implemented by the `ConnectionHandler` class which is derived from the `Thread` class. The constructor is passed a reference to the work queue created in the `main()` function.

The `run()` method implements the steps discussed in the **Consumer Thread** section of this article. All the thread mutex locking a condition signaling is handled internally by the work queue class so we don’t have to worry about.

{% highlight c++ linenos %}
class ConnectionHandler : public Thread
{
    wqueue<WorkItem*>& m_queue;

  public:
    ConnectionHandler(wqueue<WorkItem*>& queue) : m_queue(queue) {}

    void* run() {
        // Remove 1 item at a time and process it. Blocks until an item
        // is placed on the queue.
        for (int i = 0;; i++) {
            printf("thread %lu, loop %d - waiting for item...\n",
                   (long unsigned int)self(), i);
            WorkItem* item = m_queue.remove();
            printf("thread %lu, loop %d - got one item\n",
                   (long unsigned int)self(), i);
            TCPStream* stream = item->getStream();

            // Echo messages back the client until the connection is
            // closed
            char input[256];
            int len;
            while ((len = stream->receive(input, sizeof(input)-1)) > 0 ){
                input[len] = NULL;
                stream->send(input, len);
                printf("thread %lu, echoed '%s' back to the client\n",
                       (long unsigned int)self(), input);
            }
            delete item;
        }

        // Should never get here
        return NULL;
    }
};
{% endhighlight %}

**[Lines 12-17]** Prints the thread ID and waiting status. Blocks on the `wqueue::remove()` call until a work item is placed in the queue. Prints an indication that an item has been placed on the queue then removes the item and extracts the `TCPStream` object it contains.

**[Lines 23-34]** Continually receives messages from the client, prints them to `stdout` and echoes them back to the client. When the client closes the connection, the WorkItem object is deleted then the thread returns to get another item from the queue.

### Main Function – Producer Thread

The `main()` function implements the steps discussed in the **Producer Thread** section of this article.

{% highlight c++ linenos %}
int main(int argc, char** argv)
{
    // Process command line arguments
    if ( argc < 3 || argc > 4 ) {
        printf("usage: %s <workers> <port> <ip>\n", argv[0]);
        exit(-1);
    }
    int workers = atoi(argv[1]);
    int port = atoi(argv[2]);
    string ip;
    if (argc == 4) {
        ip = argv[3];
    }

    // Create the queue and consumer (worker) threads
    wqueue<WorkItem*>  queue;
    for (int i = 0; i < workers; i++) {
        ConnectionHandler* handler = new ConnectionHandler(queue);
        if (!handler) {
            printf("Could not create ConnectionHandler %d\n", i);
            exit(1);
        }
        handler->start();
    }

    // Create an acceptor then start listening for connections
    WorkItem* item;
    TCPAcceptor* connectionAcceptor;
    if (ip.length() > 0) {
        connectionAcceptor = new TCPAcceptor(port, (char*)ip.c_str());
    }
    else {
        connectionAcceptor = new TCPAcceptor(port);        
    }                                        
    if (!connectionAcceptor || connectionAcceptor->start() > 0) {
        printf("Could not create an connection acceptor\n");
        exit(1);
    }

    // Add a work item to the queue for each connection
    while (1) {
        TCPStream* connection = connectionAcceptor->accept();
        if (!connection) {
            printf("Could not accept a connection\n");
            continue;
        }
        item = new WorkItem(connection);
        if (!item) {
            printf("Could not create work item a connection\n");
            continue;
        }
        queue.add(item);
    }

    // Should never get here
    exit(0);
}
{% endhighlight %}

**[Lines 4-13]** The number of consumer threads, the listening port and the server IP address are specified on the command line. Note that the specification of a listening IP address is optional.

**[Lines 16-24]** Create the work queue object and the number of `ConnectionHandler` threads specified on the command line. For each handler call the `Thread::start()` method ultimately calls the `ConnectionHandler::run()` method.

**[Lines 27-38]** Create the `TCPAcceptor` object for the listening port and IP address, if specified, or just the listening port if the IP address is not specified. Note that specifying the server IP address will cause the `TCPAcceptor` to listen for connections on the network interface to which the IP address is bound. When no IP address is specified, the `TCPAcceptor` listens on all network interfaces.

**[Lines 41-53]** Called in an infinite loop, `TCPAcceptor::accept()` blocks until it receives a connection.  For each connection a WorkItem is created and passed a pointer to the resulting `TCPStream` object then placed onto the work queue.

## Client Application

The client application code resides in a single file client.cpp. It starts with the header files we need from C/C++ environment and the interfaces for the `TCPConnector` class.  The client simply makes a connection, sends a message to the server and waits for the server to echo it back. This action is performed twice. In both cases the message sent and received back is displayed to `stdout`.

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

## Test Server and Client

### Build

Get the code for the project from Github – [https://github.com/vichargrave/mtserver](https://github.com/vichargrave/mtserver){:target="_blank"}. You’ll also need the code from these repositories:

- `threads` – [https://github.com/vichargrave/threads](https://github.com/vichargrave/threads){:target="_blank"}
- `wqueue` – [https://github.com/vichargrave/wqueue](https://github.com/vichargrave/wqueue){:target="_blank"}
- `tcpsockets` – [https://github.com/vichargrave/tcpsockets](https://github.com/vichargrave/tcpsockets){:target="_blank"}

Place all the directories in the same folder then cd into mtserver/ and run make. This will build the client, server and all dependencies across the folders.

### Run

First run the server listening on TCP port `9999` and with `5` consumer threads like this:

{% highlight bash %}
$ ./server 5 9999 localhost
thread 4426719232, loop 0 - waiting for item...
thread 4430274560, loop 0 - waiting for item...
thread 4429737984, loop 0 - waiting for item...
thread 4428664832, loop 0 - waiting for item...
thread 4429201408, loop 0 - waiting for item...
{% endhighlight %}

Next run a series of clients like this:

{% highlight bash %}
$ client 9999 localhost; client 9999 localhost; client 9999 localhost
{% endhighlight%}

Six messages, two by each client, are sent to the server. Both the original and echoed messages are printed to `stdout`. The output of the series of client apps should look like this:

{% highlight bash %}
sent - Is there life on Mars?
received - Is there life on Mars?
sent - Why is there air?
received - Why is there air?
sent - Is there life on Mars?
received - Is there life on Mars?
sent - Why is there air?
received - Why is there air?
sent - Is there life on Mars?
received - Is there life on Mars?
sent - Why is there air?
received - Why is there air?
{% endhighlight %}

The server output should show the thread status and the messages it receives from the clients. Note that different threads handle different connections indicating the server is distributing the work items as expected.

{% highlight bash %}
thread 4426719232, loop 0 - got one item
thread 4426719232, echoed 'Is there life on Mars?' back to the client
thread 4430274560, loop 0 - got one item
thread 4430274560, echoed 'Why is there air?' back to the client
thread 4429737984, loop 0 - got one item
thread 4429737984, echoed 'Is there life on Mars?' back to the client
thread 4428664832, loop 0 - got one item
thread 4428664832, echoed 'Why is there air?' back to the client
thread 4429201408, loop 0 - got one item
thread 4429201408, echoed 'Is there life on Mars?' back to the client
thread 4430274560, loop 1 - waiting for item...
thread 4426719232, loop 1 - waiting for item...
thread 4430274560, loop 1 - got one item
thread 4430274560, echoed 'Why is there air?' back to the client
thread 4429737984, loop 1 - waiting for item...
thread 4428664832, loop 1 - waiting for item...
thread 4429201408, loop 1 - waiting for item...
thread 4430274560, loop 2 - waiting for item...
{% endhighlight %}
