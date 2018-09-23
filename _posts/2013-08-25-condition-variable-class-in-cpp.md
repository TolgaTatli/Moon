---
layout: post
title:  "Condition Variable Class in C++"
date:   2013-08-25 12:40:37
categories: Programming
tags: C/C++ Threads
comments: true
feature: /assets/img/Condition_Variable_Class_in_C++.png
image: "/assets/img/Condition_Variable_Class_in_C++.png"
---
Condition variables are used in conjunction with mutexes by one thread to signal other threads that it has changed the state of a given variable. Synchronizing threads with the standard Pthreads functions is straightforward, but wrapping these calls in C++ classes makes them all the easier to use.

In my [last article](/mutex-class-in-cpp){:target="_blank"} I showed you how to build a `Mutex` class in C++. This time around I’ll use that class to develop a C++ wrapper for condition variables.

## Pthread Condition Variable Functions

These are the standard Pthread functions that will be incorporated in the `CondVar` class.

{% highlight c %}
#include <pthread.h>

/* Create a condition variable */
int pthread_cond_init(pthread_cond_t *mtx, const pthread_condattr_t *attr);

/* Waits on a condition variable */
int pthread_cond_wait(pthread_cond_t *cond, pthread_mutex_t *mutex);

/* Unblock a thread waiting for a condition variable */
int pthread_cond_signal(pthread_mutex_t *cond);

/* Unblock all threads waiting for a condition variable */
int pthread_cond_broadcast(pthread_mutex_t *cond);

/* Deletes a condition variable */
int pthread_cond_destroy(pthread_mutex_t *cond);
{% endhighlight %}

Each function returns `0` if successful or an error number if it fails.

Condition variables are always paired with mutexes which lock the shared resources. For an example of how these two Pthreads mechanisms can be use together, check out my blog [Multithreaded Word Queue in C++](/articles/2013-01/multithreaded-work-queue-in-cpp){:target="_blank"}.

## CondVar Class

The `CondVar` class includes two private data members, a native `pthread_cond_t` variable and the `Mutex` class with which it is associated. The constructor takes a Mutex object reference argument.  The default constructor is made private to prevent calling applications from invoking it since it makes no sense to have a CondVar object with no `Mutex` object.

{% highlight c++ %}
#include "mutex.h"

class CondVar
{
    pthread_cond_t  m_cond;
    Mutex&          m_lock;

  public:
    // just initialize to defaults
    CondVar(Mutex& mutex) : m_lock(mutex) { pthread_cond_init(&m_cond, NULL); }
    virtual ~CondVar() { pthread_cond_destroy(&m_cond); }

    int wait() { return  pthread_cond_wait(&m_cond, &(m_lock.m_mutex)); }
    int signal() { return pthread_cond_signal(&m_cond); }
    int broadcast() { return pthread_cond_broadcast(&m_cond); }

  private:
    CondVar();
};
{% endhighlight %}

The functions discussed in the previous section are wrapped by each method of the `CondVar` class. The `CondVar::wait()` method calls `pthread_cond_wait()` which requires access to the native `pthread_mutex_t` data member in the `Mutex` class. Recall that private access is granted by the Mutex class through a friend `CondVar` class statement.

## CondVar Test Application

You can get the source code for this project from GitHub – [https://github.com/vichargrave/condvar.git](– https://github.com/vichargrave/condvar.git){:target="_blank"}.

The `CondVar` class test program relies on my `Mutex` and `Thread` classes which I wrote about in previous blogs. The application declares a `CondVarTest` thread class which works with the `main()` thread to use a single condition variable and corresponding variable whose state is changed.

Like the `Mutex` test application, testing condition variables in a simple way is a little tricky. In this example, I want the test thread to change value from `0` to `1`. So I added some delay to the thread’s run method and let `main()` get the mutex lock ahead of the `CondVarTest` thread. When `main()` discovers the value is still `0`, it waits for the test thread to set the value to `1`. The condition variable waits which automatically, and temporarily, releases the mutex so the test thread can acquire it and set value to `1`. When that happens test thread calls `CondVar::signal()` which in turn wakes up `main()` to check the value then exit when it sees `value == 1`.

{% highlight c++ %}
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string>

int value;

class ConditionTest : public Thread
{
     CondVar &m_cond;
     Mutex   &m_mutex;

  public:
     ConditionTest(CondVar& cond, Mutex& mutex) : m_cond(cond), m_mutex(mutex) {}
     void* run() {
         // give main a chance to get the lock first
         sleep(2);
         printf("thread waiting to get mutex\n");
         m_mutex.lock();
         printf("thread got mutex lock\n");
         // hold lock for awhile to make main thread wait
         sleep(5);
         printf("thread set value to 1\n");
         value = 1;
         m_mutex.unlock();
         m_cond.signal();
         return NULL;
     }
};

int main(int argc, char** argv)
{
    Mutex   mutex;
    CondVar cond(mutex);
    ConditionTest test(cond,mutex);
    test.start();

    printf("main() waiting to get mutex\n");
    mutex.lock();
    printf("main() got mutex lock\n");
    // wait for thread to change value
    while (value == 0)
    {
        cond.wait();
    }
    printf("main() detected value set to 1\n");
    mutex.unlock();
    test.join();

    exit(0);
}
{% endhighlight %}

When the test program is run, `main()` locks the mutex and checks to value to be set to 1. The test thread in the meantime acquires the lock that is released when `main()` waits then sleeps for 5 seconds.  The output at this point looks like this:

{% highlight bash %}
main() waiting to get mutex
main() got mutex lock
thread waiting to get mutex
thread got mutex lock
{% endhighlight %}

After 5 seconds the test thread sets the value to 1 and signals `main()` that is has done this. The main thread wakes up, detects the change and prints out the results:

{% highlight bash %}
main() waiting to get mutex
main() got mutex lock
thread waiting to get mutex
thread got mutex lock
thread set value to 1
main() detected value set to 1
{% endhighlight %}
