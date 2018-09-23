---
layout: post
title:  "XML Parsing with DOM in Java"
date:   2013-02-20 12:40:37
categories: Programming
tags: Java XML
comments: true
feature: /assets/img/XML_Parsing_with_DOM_in_Java.png
image: "/assets/img/XML_Parsing_with_DOM_in_Java.png"
---
In my blog [XML Parsing with DOM in C++](/xml-parsing-with-dom-in-cpp){:target="_blank"}, I used the Xerces-C++ XML Parser as the foundation for the XML parsing API. The classes from that article are also useful for and can be implemented in Java. The difference is Java includes support for XML parsing with both the SAX and DOM models.

You can read up on the specifics of the DOM model in my previous article, so let’s dive right into the API code.

## Input File

First, the XML file I’ll use to test the XML parsing API is the bookstore example from before:

{% highlight xml %}
<bookstore>
    <book category="cooking">
        <title lang="en">Everyday Italian</title>
        <author>Giada De Laurentis</author>
        <year>2005</year>
        <price>30.00</price>
    </book>
    <book category="children">
        <title lang="es">Harry Potter and the Half-Blood Prince</title>
        <author>J. K. Rowling</author>
        <year>2005</year>
        <price>29.99</price>
    </book>
</bookstore>
{% endhighlight %}

After parsing this file I want to be able to find the number of parent XML elements with a given tag, the attributes for the specified parent and the values of the child elements it contains.

In the bookstore XML example file, there are 2 parent elements with a tag of `book`.  Each book has a `category` attribute and 4 child elements with tags: `title`, `author`, `year`, and `price`.

## XmlDomDocument Class

The `XmlDomDocument` class shown below encapsulates the Java DOM API calls I’ll use.

{% highlight java linenos %}
package com.example

import java.io.File;
import java.io.FileInputStream;
import java.io.StringWriter;
import java.io.Writer;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.*;

public class XmlDomDocument {

    private Document m_doc;

    public XmlDomDocument(String xmlfile) throws Exception
    {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        m_doc = builder.parse(new FileInputStream(new File(xmlfile)));
    }

    public int getChildCount(String parentTag, int parentIndex, String childTag)
    {
        NodeList list = m_doc.getElementsByTagName(parentTag);
        Element parent = (Element) list.item(parentIndex);
        NodeList childList = parent.getElementsByTagName(childTag);
        return childList.getLength();
    }

    public String getChildValue(String parentTag, int parentIndex, String childTag, int childIndex)
    {
        NodeList list = m_doc.getElementsByTagName(parentTag);
        Element parent = (Element) list.item(parentIndex);
        NodeList childList = parent.getElementsByTagName(childTag);
        Element field = (Element) childList.item(childIndex);
        Node child = field.getFirstChild();
        if (child instanceof CharacterData) {
            CharacterData cd = (CharacterData) child;
            return cd.getData();
        }
        return "";
    }

    public String getChildAttribute(String parentTag, int parentIndex, String childTag, int childIndex, String attributeTag) {
        NodeList list = m_doc.getElementsByTagName(parentTag);
        Element parent = (Element) list.item(parentIndex);
        NodeList childList = parent.getElementsByTagName(childTag);
        Element element = (Element) childList.item(childIndex);
        return element.getAttribute(attributeTag);
    }
}
{% endhighlight %}

### Constructor

**[Lines 17-19]** The constructor uses creates a `DocumentBuilderFactory` object then a `DocumentBuilder` object to the parse the given XML file.

### Get Child Count

**[Lines 24-25]** DOM documents consists of lists of nodes, so get the NodeList with the specified parent tag by calling `Document.getElementsByTagName()` then get the parent element at the given parent index by calling `list/item()`.

**[Lines 26-27]** In a similar fashion get the list of child nodes from the parent element.  The child count is simple the count of children the list which we get by the `NodeList.getLength()` method.

### Get Child Element Value

**[Lines 32-34]** To get the child element values, `getChildValue()` looks up the node list for the specified parent tag with a call to `Document.getElementsByName()`. Next the parent element at the given index is retrieved by calling `NodeList.item()`.

**[Lines 32-34]** Since the desired child element is yet another NodeList, we call `Document.getElementsByName()` to get the child list of nodes then `NodeList.item()` with the given child index to get the child element.

**[Lines 35-41]** Extract the child element data and return it in a `String`.  If there is none, return a `null` `String`.

### Get Child Attribute Value

**[Lines 45-49]** The `getChildAttribute()` method works the same as `getChildValue()`, except when the child element is obtained, the child attribute value corresponding to the specified attribute tag is returned.

## Test Application

### Code

The `ParseTest` class parses the *bookstore.xml* file then prints out the attribute and child values for each book.

{% highlight java  %}
package com.example;

public class ParseTest {
    public static void main(String[] args) {
        ParseTest test = new ParseTest();
        try {
            XmlDomDocument doc = new XmlDomDocument("./bookstore.xml");
            int count = doc.getChildCount("bookstore", 0, "book");
            for (int i = 0; i < count; i++) {
                System.out.println("Book "+Integer.toString(+1));
                System.out.println("book category   - "+doc.getChildAttribute("bookstore", 0, "book", i, "category"));
                System.out.println("book title      - "+doc.getChildValue("book", i, "title", 0));
                System.out.println("book title lang - "+doc.getChildAttribute("book", i, "title", 0, "lang"));
                System.out.println("book author     - "+doc.getChildValue("book", i, "author", 0));
                System.out.println("book year       - "+doc.getChildValue("book", i, "year", 0));
                System.out.println("book price      - "+doc.getChildValue("book", i, "price", 0));
            }
        }
        catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
{% endhighlight %}

### Build and Run

You can get the code for the project at Github – [https://github.com/vichargrave/xmldom-java.git](https://github.com/vichargrave/xmldom-java.git){:target="_blank"}. You’ll need NetBeans 7.3 to build the project. After you get it follow these instructions to build and run the test application:

1. Right click on the **xmldom-java** project.
2. Select **Run**.

The output from `ParseTest` will look like this:

{% highlight bash %}
Book 1
book category   - cooking
book title      - Everyday Italian
book title lang - en
book author     - Giada De Laurentis
book year       - 2005
book price      - 30.00
Book 1
book category   - children
book title      - Harry Potter and the Half-Blood Prince
book title lang - es
book author     - J. K. Rowling
book year       - 2005
book price      - 29.99
{% endhighlight %}
