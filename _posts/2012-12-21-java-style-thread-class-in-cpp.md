---
layout: post
title:  "Java Style Thread Class in C++"
date:   2012-12-21 12:40:37
categories: Programming
tags: C/C++ Threads
comments: true
feature: /assets/img/Java_Style_Thread_Class_in_C++.png
image: "/assets/img/Java_Style_Thread_Class_in_C++.png"
---
Java provides the `Thread` class that enables developers to easily create multiple threads in Java applications. Pthreads is commonly used for multithreaded programming in C and C++, but this API is procedural and somewhat less convenient to use than Java’s object oriented thread interface.

However, it is possible to mimic Java threads behaviors by wrapping Pthreads calls in a C++ class that will let you create threads *Java style*.

<!--more-->

### Java Threads Overview

With Java all you have to do to create a thread is subclass `Thread` overriding the `run()` method with your own method that will do what you want you thread to do. Here’s a quick example from the [Oracle Java docs page](http://docs.oracle.com/javase/6/docs/api/java/lang/Thread.html){:target="_blank"}:

{% highlight java %}
class PrimeThread extends Thread {
    long minPrime;
    PrimeThread(long minPrime) {
        this.minPrime = minPrime;
    }

    public void run() {
        // compute primes larger than minPrime
           ...
    }
}
{% endhighlight %}

This code would then create and run a Java thread:

{% highlight c++ %}
PrimeThread p = new PrimeThread(143);
p.start();
{% endhighlight %}

The Java `Thread` class also provides methods to start the thread at time of the caller’s choosing, wait for the thread to finish and detach the thread so that it does not require another thread to wait for it to finish.

### Thread Class Interface

Let’s start with the C++ `Thread` class declaration which will be contained in a header file *thread.h*. We need to include *pthread.h* for the Pthreads API. Public methods include: constructor, destructor, `start()`, `join()`, `detach()` and get thread ID (`Thread::self()`).

{% highlight c++ %}
#include <pthread.h>

class Thread
{
  public:
    Thread();
    virtual ~Thread();

    int start();
    int join();
    int detach();
    pthread_t self();

    virtual void* run() = 0;

  private:
    pthread_t  m_tid;
    int        m_running;
    int        m_detached;
};
{% endhighlight %}

Setting the `virtual` run method to `0` forces this class to be abstract and requires that `run()` to be overriden in any subclass of `Thread`. The destructor is also declared virtual to make sure that a Thread subclass object destructor is called when the object is deleted thought a base `Thread` class pointer.

The class features three private member variables.

- `m_tid` – contains the thread ID
- `m_running` – flag that is `0` when the thread is not running or `1` when it is
- `m_detached` – flag that is `0` when the thread is not detached or `1` when it is. I’ll have more to say about thread detatched state later in the article.

### Thread Class Definition

#### Constructor

The `Thread` class definition is included in the *thread.cpp* file. The constuctor method is very simple. It just initializes the member variables to `0`.

{% highlight c++ %}
Thread::Thread() : m_tid(0), m_running(0), m_detached(0) {}
{% endhighlight %}

#### Destructor

When destroying a Thread object we want to check to see if the thread is still running and stop it if it is. The call to `pthread_cancel()` will ensure the thread is shutdown at some point in the future. If we did not do this the thread woud continue to run, possibly indefinitely, after the Thread class *shell* around it was destroyed. If the thread is not detached then we want to detach it as well.

{% highlight c++ %}
Thread::~Thread()
{
    if (m_running == 1 && m_detached == 0) {
        pthread_detach(m_tid);
    }
    if (m_running == 1) {
        pthread_cancel(m_tid);
    }
}
{% endhighlight %}

#### Start Thread

The `start()` method calls `pthread_create()` to create the thread. The function accepts four arguments:

- Pointer to a `pthread_t` variable that contains the thread ID. Set this to the address of `m_tid`.
- Pointer to a an attributes object. Set this to `NULL` to set up default attributes.
- Pointer to a function that is called when the thread starts to take the thread action. The function must accept a void  pointer to an object and return a void pointer to an object. Set this to the address of the `runThread()` function, the prototype for which is shown below.
- Pointer to a data object that will be passed to the thread action function. Set to the `Thread` class this pointer. We’ll use this pointer to call the `Thread::run()` method in the `runThread()` function.

{% highlight c++ %}
static void* runThread(void* arg);

int Thread::start()
{
    int result = pthread_create(&m_tid, NULL, runThread, this);
    if (result == 0) {
        m_running = 1;
    }
    return result;
}
{% endhighlight %}

Pthread functions return 0 when they are successful and an integer > `0` when they fail. When the call to `pthread_create()` returns we check the return code. If it is `0` that means the thread was successful so set the `m_running` flag to 1. The thread m_tid member variable is set to the thread ID which is used subsequent Pthread function calls.

#### Run Method

In the call to `pthread_create()` the last argument is a void pointer to a data structure which will be passed to the `runThread()` function when it is called. Since the input argument to the `runThread()` is the Thread class this pointer, we can cast it to a `Thread` pointer then use it to call the `Thread::run()` method. Due to polymorphism, the `Thread` subclass `run()` method will be called to carry out the thread’s action.

{% highlight c++ %}
static void* runThread(void* arg)
{
    return ((Thread*)arg)->run();
}
{% endhighlight %}

#### Join Thread

By default Pthreads are joinable. meaning you can wait for them to complete with a call to `pthread_join()`. The `Thread` class join method checks to see if the thread is running, then calls this function to wait for the thread to complete. If the call is successful the thread is marked as detached since `pthread_join()` automatically detatches a thread.

{% highlight c++ %}
int Thread::join()
{
    int result = -1;
    if (m_running == 1) {
        result = pthread_join(m_tid, NULL);
        if (result == 0) {
            m_detached = 1;
        }
    }
    return result;
}
{% endhighlight %}

#### Detach Thread

This is a utility method that detaches a thread when the caller doesn’t want to wait for the thread to complete. If the thread is running and not detached, `pthread_detach()` is called and the thread is flagged as detached if the call is successful.

{% highlight c++ %}
int Thread::detach()
{
    int result = -1;
    if (m_running == 1 && m_detached == 0) {
        result = pthread_detach(m_tid);
        if (result == 0) {
            m_detached = 1;
        }
    }
    return result;
}
{% endhighlight %}

#### Get Thread ID

This is another utility method that returns the thread ID for display or logging purposes.

{% highlight c++ %}
pthread_t Thread::self() {
    return m_tid;
}
{% endhighlight %}

### Test Application

#### Create Thread Subclass

The test application is defined in the *main.cpp* file. First we create a `Thread` subclass called `MyThread` that supplies a run method which simply prints a message to `stdout` five times then quits. Each time through the loop a delay of 2 seconds is added so it is easier to observe what it displayed on stdout. Each message will display the Pthread ID which is cast as a `long unsigned int`. For this simple thread class we don’t need set up any internal data so we don’t have to supply a constructor or destructor. The base class constructor and destructor are sufficient.

{% highlight c++ %}
#include <stdio.h>
#include <stdlib.h>
#indluce <unistd.h>
#include "thread.h"

class MyThread : public Thread
{
  public:
    void *run() {
        for (int i = 0; i < 5; i++) {
            printf("thread %lu running - %d\n",  (long unsigned int)self(), i+1);
            sleep(2);
        }
        printf("thread done %lu\n", (long unsigned int)self());
        return NULL;
    }
};
{% endhighlight %}

#### Main Function

Next we define a `main()` function that will create two `MyThread` objects, start them and then wait for each to finish.

{% highlight c++ %}
int main(int argc, char** argv)
{
    MyThread* thread1 = new MyThread();
    MyThread* thread2 = new MyThread();
    thread1->start();
    thread2->start();
    thread1->join();
    thread2->join();
    printf("main done\n");
    exit(0);
}
{% endhighlight %}

#### Build and Run

You can get the source code for the project from Github – [https://github.com/vichargrave/threads.git](https://github.com/vichargrave/threads.git){:target="_blank"}. To build it just *cd* into the project directory and type *make*.

Running the app will produce the following output:

{% highlight bash %}
$ ./thread
thread 4428664832 running - 1
thread 4429201408 running - 1
thread 4428664832 running - 2
thread 4429201408 running - 2
thread 4428664832 running - 3
thread 4429201408 running - 3
thread 4429201408 running - 4
thread 4428664832 running - 4
thread 4429201408 running - 5
thread 4428664832 running - 5
thread done 4429201408
thread done 4428664832
main done
{% endhighlight %}
