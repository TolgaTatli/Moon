---
layout: post
title:  "Mutex Class in C++"
date:   2013-08-17 12:40:37
categories: Programming
tags: C/C++ Threads
comments: true
feature: /assets/img/Mutex_Class_in_C++.png
---
When multiple threads want to synchronize access to a shared resource they use mutexes and condition variables. A mutex enables a thread to block other threads from accessing a shared resource, while a condition variable is used by a thread to make itself wait for the state of a resource to be changed by other threads.

In my next two blogs I’ll illustrate how to simplify Pthread mutex and condition variable functions by wrapping them in C++ classes, starting with mutexes.

<!--more-->

### Pthread Mutex Functions

These are the standard Pthread functions that will be incorporated in the Mutex class.

{% highlight c %}
#include <pthread.h>
/* Create a mutex */
int pthread_mutex_init(pthread_mutex_t *mtx, const pthread_mutexattr_t *attr);

/* Locks the mutex blocking on it until the lock is acquired */
int pthread_mutex_lock(pthread_mutex_t *mutex);

/* Attempt to lock a mutex without blocking */
int pthread_mutex_trylock(pthread_mutex_t *mutex);

/* Unlocks a mutex */
int pthread_mutex_unlock(pthread_mutex_t *mutex);

/* Deletes a mutex */
int pthread_mutex_destroy(pthread_mutex_t *mutex);
{% endhighlight %}

Each function returns `0` if successful or an error number if it fails.

### Mutex Class

The `Mutex` class provides a method that wraps each of the Pthread mutex functions and contains a private `pthread_mutex_t` variable which is use by the function calls. This hides the parameter so applications that call the `Mutex` class methods do not have to provide it.  Note that I declare a friend class `CondVar` which will need to have access to the private `m_mutex` data member as you’ll see in my next blog.

Owing to its simplicity the class can be defined in a single include file *Mutex.h*. Each method simply calls the corresponding Pthread mutex function and returns whatever it returns. When `pthread_mutex_init()` is called, the attribute argument is set to `NULL` to accept the default behavior.

{% highlight c++ %}
#include <pthread.h>
class Mutex
{
    friend class CondVar;
    pthread_mutex_t  m_mutex;

  public:
    // just initialize to defaults
    Mutex() { pthread_mutex_init(&m_mutex, NULL); }
    virtual ~Mutex() {
	    pthread_mutex_unlock(&m_mutex);
	    pthread_mutex_destroy(&m_mutex);
	}

    int lock() { return  pthread_mutex_lock(&m_mutex); }
    int trylock() { return  pthread_mutex_trylock(&m_mutex); }
    int unlock() { return  pthread_mutex_unlock(&m_mutex); }   
};
{% endhighlight %}

### Mutex Test Application

You can get the source code for this project from GitHub – [https://github.com/vichargrave/mutex.git](https://github.com/vichargrave/mutex.git){:target="_blank"}.

The `Mutex` class test program relies on my `Thread` class which I wrote about awhile back. The application declares a MutexTest thread class which works with the `main()` thread to lock a single `Mutex` object.

The trick here is to give the MutexTest thread time to lock the `Mutex` before `main()` so we see the main thread waiting to acquire lock. So after creating the MutexTest thread, `main()` sleeps for 1 second during which time the `MutexTest` thread acquires the lock. `MutexTest` then sleeps 10 seconds before unlocking the `Mutex` at which point `main()` acquires the lock and proceeds to run.

{% highlight c++ %}
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include "thread.h"
#include "mutex.h"

class MutexTest : public Thread
{
    Mutex &m_mutex;

  public:
    MutexTest(Mutex& mutex) : m_mutex(mutex) {}
    void* run() {
        printf("thread waiting to get mutex\n");
        m_mutex.lock();
        printf("thread got mutex lock\n");
        // hold lock for awhile to make main thread wait
        sleep(10);
        m_mutex.unlock();
        return NULL;
    }
};

int main(int argc, char** argv)
{
    Mutex mutex;
    MutexTest test(mutex);
    test.start();

    // give the test thread a chance to acquire lock first
    sleep(1);

    // now it's main thread's turn
    printf("main waiting to get mutex\n");
    mutex.lock();
    printf("main got mutex lock\n");
    mutex.unlock();
    test.join();

    exit(0);
}
{% endhighlight %}

When the test application is run, the output looks like this after 1 second:

{% highlight bash %}
thread waiting to get mutex
thread got mutex lock
main waiting to get mutex
{% endhighlight %}

This indicates the Mutex is working. The application pauses at this point while main() waits 10 seconds to acquire the lock. When this time elapses the output looks like this:

{% highlight bash %}
thread waiting to get mutex
thread got mutex lock
main waiting to get mutex
main got mutex lock
{% endhighlight %}
