---
layout: post
title:  "Multithreaded Work Queue in C++"
date:   2013-01-04 12:40:37
categories: Programming
tags: C/C++ Threads
comments: true
feature: /assets/img/Multithreaded_Work_Queue_in_C++.png
image: "/assets/img/Multithreaded_Work_Queue_in_C++.png"
---
In a previous blog [Java Style Thread Class in C++](/articles/2012-12/java-style-thread-class-in-cpp){:target="_blank"} I discussed how to develop a C++ class that enables you to create Pthread based objects that resemble Java threads. The next step to building a multithreaded application is to devise a means to distribute tasks between threads so they can be processed concurrently.

Queues are good devices for transferring work items from one thread to another. In this article I’ll discuss the design of a work queue class implemented in C++ that can be used with Thread class objects to easily build a multithreaded application.

<!--more-->

### Producer-Consumer Model

One approach to multithreading is the *producer-consumer* model where one thread – the producer – places work items in a queue and one or more consumer threads waits for and removes the items to process. For the work wqueue class in this article we’ll use one producer thread and two consumer threads.

![](/assets/img/producer-consumer-model.png){: .image-left-justify}

When a consumer thread runs it checks the number of items on the queue. If there are one ore more work items on the queue the consumer removes one and processes it. If none are available the consumer waits for the producer to add items to the queue. These steps are repreated continually for the lifetime of the application.

### Work Queue Class

#### Interface

The work queue class wqueue will be defined in the file *wqueue.h*. It is based on the list class from the Standard C++ Library. Lists provide methods for adding work items to the tail of the queue and removing items from the head of the queue – first in first out (FIFO) – in constant time. To serialize access to the queue and enable the producer thread to signal the consumer threads that work items are available for processing the queue class will be instrumented with a Pthread mutex and condition variable – defined by the `m_mutex` and `m_condv` member variables respectively in this case.

{% highlight c++ linenos %}
#include <pthread.h>
#include <list>

using namespace std;

template <typename T> class wqueue
{
    list<T>   m_queue;
    pthread_mutex_t m_mutex;
    pthread_cond_t  m_condv;

public:
    wqueue() {
        pthread_mutex_init(&m_mutex, NULL);
        pthread_cond_init(&m_condv, NULL);
    }
    ~wqueue() {
        pthread_mutex_destroy(&m_mutex);
        pthread_cond_destroy(&m_condv);
    }
    void add(T item) {
        pthread_mutex_lock(&m_mutex);
        m_queue.push_back(item);
        pthread_cond_signal(&m_condv);
        pthread_mutex_unlock(&m_mutex);
    }
    T remove() {
        pthread_mutex_lock(&m_mutex);
        while (m_queue.size() == 0) {
            pthread_cond_wait(&m_condv, &m_mutex);
        }
        T item = m_queue.front();
        m_queue.pop_front();
        pthread_mutex_unlock(&m_mutex);
        return item;
    }
    int size() {
        pthread_mutex_lock(&m_mutex);
        int size = m_queue.size();
        pthread_mutex_unlock(&m_mutex);
        return size;
    }
};
{% endhighlight %}

**[Lines 6-10]** The `wqueue` class is defined as a template class since it uses a list object to queue work items of arbitrary class. The work item classes used in the test application will be discussed later in the article.  The great advantage to creating a work queue class in C++ is it encpasulates the Pthread mechanisms necessary to serialize access to the work items on the list and signal when work items are added to the list. Programs that use the work queue can add and remove items with single method calls `add()` and `remove()` without having to concern themselves with the intricacies of making Pthread calls.

#### Constructor

**[Lines 13-16]** The constructor simply initializes the Pthread mutex and condition variable data members.

#### Destructor

**[Lines 17-20]** The destructor deletes the mutex and condition variables. The `list` object is destroyed automatically.

#### Add a Work Item

To add a work item to the queue the `add()` method is called passing a copy of the work item object. Normally standard C++ collections keep references to the template class object. But for the work queue example the typename T will be work item pointers, so when the `add()` method is called it will be passed a pointer by value and a reference to the pointer is stored in the list. You are better off storing pointers to work items on a queue so that you can control when they are destroyed.

**[Lines 21-26]** To serialize access to the list the mutex is locked and when the lock is acquired a reference to an item pointer is pushed to the back of the list. Then the condition variable is signaled with a call to `pthread_cond_signal()` which wakes up one of the consumer threads waiting to remove an item. Calling `pthread_cond_broadcast()` to signal the condition variable would also work but this would cause all the consumer threads to wake up. Since only one of the consumers at any given time can get a work item, the others would have to go back to sleep waiting for additional work items to placed on the queue. By signalling the condition instead of broadcasting, we ensure that only one thread wakes up at a time for each item added.

#### Remove a Work Item

**[Lines 27-36]** The `remove()` method locks the mutex then checks to see if any work items are available. If not, `pthread_cond_wait()` is called which automatically unlocks the mutex and waits for the producer thread to add an item. When the condition is signaled after an item is added by the producer thread, a copy of a pointer to a work item is taken off the list and returned to the consumer thread. Note that if items are added to the queue while all the consumer threads are busy, there will be no consumer threads to receive the condition variable signals. However this is not a problem since the consumers always check the queue size when they return from doing work **before** trying to remove any work items.

#### Queue Size

**[Lines 37-42]** The `size()` method is just a utility method we can use to externally check the number of items on to the queue. The mutex must be locked and unlocked during this operation to avoid a race condition with the producer thread trying to add or another consumer thread trying to remove an item.

### Worker Item Class

Work items will simply be a string and a number that are set to arbitrary values in the producer thread.  Both values can be retrieved with their corresponding `get` methods.

{% highlight c++ %}
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include "thread.h"
#include "wqueue.h"

class WorkItem
{
    string m_message;
    int    m_number;

  public:
    WorkItem(const char* message, int number)
          : m_message(message), m_number(number) {}
    ~WorkItem() {}

    const char* getMessage() { return m_message.c_str(); }
    int getNumber() { return m_number; }
};
{% endhighlight %}

### Consumer Thread Class

The `Thread` class from my [previous blog](/articles/2012-12/java-style-thread-class-in-cpp){:target="_blank"} is used to create the consumer threads. Each thread is passed a reference the the work queue so it can grab work items. The `run()` method continually waits for and removes items to be processed which in this case just means displaying the string message and number assigned in the producer thread. The ID of each thread is also displayed to differentiate them in the printed output.

{% highlight c++ %}
class ConsumerThread : public Thread
{
    wqueue<WorkItem*>& m_queue;

  public:
    ConsumerThread(wqueue<WorkItem*>& queue) : m_queue(queue) {}

    void* run() {
        // Remove 1 item at a time and process it. Blocks if no items are
        // available to process.
        for (int i = 0;; i++) {
            printf("thread %lu, loop %d - waiting for item...\n",
                  (long unsigned int)self(), i);
            WorkItem* item = (WorkItem*)m_queue.remove();
            printf("thread %lu, loop %d - got one item\n",
                  (long unsigned int)self(), i);
            printf("thread %lu, loop %d - item: message - %s, number - %d\n",
                  (long unsigned int)self(), i, item->getMessage(),
                   item->getNumber());
            delete item;
        }
        return NULL;
    }
}
{% endhighlight %}

### Test Application

#### Producer Thread

The producer thread is nothing more that the `main(`) routine of the test application which is defined in the file main.cpp as is the remainder of the code in this article. The number of iterations through the main loop is passed in the command line. Two consumer threads are created and a single work queue. After the threads are started they will wait for items to be placed on the queue.

{% highlight c++ %}
int main(int argc, char** argv)
{
    // Process command line arguments
    if ( argc != 2 ) {
        printf("usage: %s <iterations>\n", argv[0]);
        exit(-1);
    }
    int iterations = atoi(argv[1]);

    // Create the queue and consumer (worker) threads
    wqueue<WorkItem*>  queue;
    ConsumerThread* thread1 = new ConsumerThread(queue);
    ConsumerThread* thread2 = new ConsumerThread(queue);
    thread1->start();
    thread2->start();

    // Add items to the queue
    WorkItem* item;
    for (int i = 0; i < iterations; i++) {
        item = new WorkItem("abc", 123);
        queue.add(item);
        item = new WorkItem("def", 456);
        queue.add(item);
        item = new WorkItem("ghi", 789);
        queue.add(item);
        sleep(2);
    }

    // Ctrl-C to end program
    sleep(1)
    printf("Enter Ctrl-C to end the program...\n");
    while (1);
    exit(0);
}
{% endhighlight %}

Each time through the main loop, 3 items are placed in the queue. After the specified number of iterations the producer will wait for a Ctrl-C to end the program.

#### Build and Run

You can get the source code for the project from Github – [https://github.com/vichargrave/wqueue.git](https://github.com/vichargrave/wqueue.git){:target="_blank"}. The `main()` routine, work item class and consumer thread class definitions are all contained in the main.cpp file. You can build the test application by going into the wqueue directory and running make. Note that you must get the [Thread class code](/articles/2012-12/java-style-thread-class-in-cpp){:target="_blank"} before trying to make wqueue.

If you run the test application with an argument of 3 this is what the output will look like:

{% highlight bash %}
$ ./wqueue 3
thread 4547428352, loop 0 - waiting for item...
thread 4549251072, loop 0 - waiting for item...
thread 4547428352, loop 0 - got one item
thread 4549251072, loop 0 - got one item
thread 4547428352, loop 0 - item: message - abc, number - 123
thread 4549251072, loop 0 - item: message - def, number - 456
thread 4547428352, loop 1 - waiting for item...
thread 4549251072, loop 1 - waiting for item...
thread 4547428352, loop 1 - got one item
thread 4547428352, loop 1 - item: message - ghi, number - 789
thread 4547428352, loop 2 - waiting for item...
thread 4549251072, loop 1 - got one item
thread 4547428352, loop 2 - got one item
thread 4549251072, loop 1 - item: message - abc, number - 123
thread 4547428352, loop 2 - item: message - def, number - 456
thread 4549251072, loop 2 - waiting for item...
thread 4547428352, loop 3 - waiting for item...
thread 4549251072, loop 2 - got one item
thread 4549251072, loop 2 - item: message - ghi, number - 789
thread 4549251072, loop 3 - waiting for item...
thread 4547428352, loop 3 - got one item
thread 4549251072, loop 3 - got one item
thread 4547428352, loop 3 - item: message - abc, number - 123
thread 4549251072, loop 3 - item: message - def, number - 456
thread 4547428352, loop 4 - waiting for item...
thread 4549251072, loop 4 - waiting for item...
thread 4547428352, loop 4 - got one item
thread 4547428352, loop 4 - item: message - ghi, number - 789
thread 4547428352, loop 5 - waiting for item...
done
{% endhighlight %}
