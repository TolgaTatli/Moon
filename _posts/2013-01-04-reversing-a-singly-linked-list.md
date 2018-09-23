---
layout: post
title:  "Reversing a Linked List"
date:   2013-01-04 12:40:37
categories: Programming
tags: C/C++
comments: true
feature: /assets/img/Reversing_a_Linked_List.png
image: "/assets/img/Reversing_a_Linked_List.png"
---
In all my years as a software developer, reversing a singly linked list is not something I’ve had to do. But it is a commonly asked question in interviews for programming positions. Of course the easy solution to the problem is to place items in a Standard C++ collection, like a vector, then apply the `reverse()` function to the collection.

For those of you who want or have to roll your own solution, here is an example of a simple list structure and a reverse list function.

## Linked List Node

All the code for linked list and test application in this example is defined in a single file *rlist.cpp*. The nodes to be stored in the linked list will simply contain and integer value and a pointer to the next node in the list.

{% highlight c %}
#include <stdio.h>
#include <stdlib.h>
typedef struct node_t node_t;
struct node_t
{
    int     m_value;
    node_t* m_next;
};
{% endhighlight %}

The linked list to be created will be of the most basic type. There will be a head pointer and the last node will have the `m_next` member variable set to `NULL`.

## Node Creation

The `createNode()` function gets the integer to be storied then creates a `node_t` item to contain it and sets the next pointer to NULL.

{% highlight c %}
node_t* createNode(int value)
{
    node_t* newNode = (node_t*)malloc(sizeof(node_t));
    if (newNode)
    {
        newNode->m_value = value;
        newNode->m_next = NULL;
    }
    return newNode;
}
{% endhighlight %}

## Add a Node

New nodes will be placed at the end of the linked list.  To find the end, iterate through the list items until an item with `m_next` set to `NULL` is encountered. Then set this item’s `m_next` to the new node pointer.

{% highlight c %}
void addNode(node_t** list, int value)
{
    if (!*list)
    {
        *list = createNode(value);
        return;
    }
    node_t* listPtr = *list;
    while (listPtr->m_next)
    {
        listPtr = listPtr->m_next;
    }
    listPtr->m_next = createNode(value);
}
{% endhighlight %}

## Print the List

To check the items on the queue the `printList()` function iterates through the list printing the value at each node that is encountered. So we can see everything easily, all the values of a list will be displayed on one line.

{% highlight c %}
void printList(node_t* list)
{
    while (list)
    {
        printf("%d\n", list->m_value);
        list = list->m_next;
    }
    printf("\n");
}
{% endhighlight %}

## Reverse the List

Now the function you have been waiting for. The trick to this algorithm is you need 3 node_t pointers to accomplish the reversal.

1. `next` - Tracks the pointer to the next item in the list.
2. `head` - Initially contains the original head of the list but will then be set to the pointer to the next item in the list until the `NULL` pointer is encountered.
3. `cursor` - Initially is set to `NULL` but then tracks the new head of the list. At the end of the list, `head` equals `NULL` and the value of `cursor` is returned to the caller.

{% highlight c %}
node_t* reverseList(node_t* head)
{
    node_t* cursor = NULL;
    node_t* next;
    while (head)
    {
        next = head->m_next;
        head->m_next = cursor;
        cursor = head;
        head = next;
    }
    return cursor;
}
{% endhighlight %}

The reversal step occurs when `head->m_next` is set to the value contained in cursor which always contains the pointer to the previous item in the list. When the function reaches the end of the list the new head pointer is returned in cursor.

## Test Application

### Code

To test the reverse link list algorithm, we’ll add numbers to the linked list from 0 – 19, in order, then call `reverseList()` to reorder the numbers.

{% highlight c %}
int main(int argc, char** argv)
{
    int i;
    node_t* head = NULL;

    for (i = 0; i < 20; i++) {
        addNode(&head, i);
    }
    printList(head);
    head = reverseList(head);
    printList(head);

    exit(0);
}
{% endhighlight %}

### Build and Run

You can get the source code for the project from Github – [https://github.com/vichargrave/rlist.git](https://github.com/vichargrave/rlist.git){:target="_blank"}. To build the test application just cd into the `rlist` directory then run *make*.

When you run the program you will get this output:

{% highlight c %}
$ ./rlist
0  1  2  3  4  5  6  7  8  9  10  11  12  13  14  15  16  17  18  19  
19  18  17  16  15  14  13  12  11  10  9  8  7  6  5  4  3  2  1  0
{% endhighlight %}
