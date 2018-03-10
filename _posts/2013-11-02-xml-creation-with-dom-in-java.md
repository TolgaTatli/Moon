---
layout: post
title:  "XML Creation with DOM in Java"
date:   2013-11-02 12:40:37
categories: Programming
tags: Java XML
comments: true
feature: /assets/img/XML_Creation_with_DOM_in_Java.png
image: "/assets/img/XML_Creation_with_DOM_in_Java.png"
---
Awhile back I wrote a blog about [parsing XML documents](/xml-parsing-with-dom-in-java){:target="_blank"} with the DOM facilities provided by Java. As it turns out you can use the same API to programmatically create an XML document.

So I’ve dusted off the old `XmlDomDocument` class and added some methods that make it easy to build an XML document from scratch.

<!--more-->

### XmlDomDocument Class

I’m just adding some methods to the `XmlDomDocument` class, so I won’t show the original methods.

{% highlight java linenos %}
package com.example;

import java.io.File;
import java.io.FileInputStream;
import java.io.StringWriter;
import java.io.Writer;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.*;

public class XmlDomDocument {

    private Document m_doc;

    // Note: The parse methods have been omitted in this code listing

    public XmlDomDocument() throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        m_doc = builder.newDocument();
    }

    public void addChildElement(String parentTag, int parentIndex, String childTag, String childValue) {
        NodeList list = m_doc.getElementsByTagName(parentTag);
        Element parent = (Element) list.item(parentIndex);
        Element child = m_doc.createElement(childTag);
        if (childValue != null) {
            child.appendChild(m_doc.createTextNode(childValue));
        }
        if (parent == null) {
            m_doc.appendChild(child);
        }
        else {
            parent.appendChild(child);
        }
    }

    public void setAttributeValue(String elementTag, int elementIndex, String attributeTag,
                                  String attributeValue) {
        NodeList list = m_doc.getElementsByTagName(elementTag);
        Element element = (Element) list.item(elementIndex);
        element.setAttribute(attributeTag, attributeValue);
    }

    public String renderXml() throws Exception {
        Transformer tf = TransformerFactory.newInstance().newTransformer();
        tf.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        tf.setOutputProperty(OutputKeys.INDENT, "yes");
        Writer out = new StringWriter();
        tf.transform(new DOMSource(m_doc), new StreamResult(out));
        return out.toString();
    }
}
{% endhighlight %}

#### Constructor

**Lines [23-25]**  The new constructor does not take any arguments since it is not parsing an XML document, but rather creating a new blank document. DocumentBuilderFactory gets a new `DocumentBuilder`. Call `DocumentBuilder.newDocument()` without arguments to create a new blank DOM document.

#### Add Child Element

**Lines [29-31]** Find the node list with the given parent name by calling `DOMDocument.getElementsByTagName()` and get the parent element at the given index with `NodeList.item()`.  Create a child element with the given child tag.

**Lines [32-40]** Create a child element with `Element.appendChild()` supplying the argument `DOMDocument.createTextNode()` to immediately assign a value to the element. If no parent name specified, then this is a root element so assign it to the top level of the document. Otherwise place the child element under the given parent.

#### Set Element Attribute

**Lines [45-47]** Find the node list with the given element name by calling `DOMDocument.getElementsByTagName()`  then get the element on this list at the given index with `NodeList.item()`, Set the attribute name and value for the element with `Element.setAttribute()`.

#### Render XML Document

**Lines [51-53]** The Java `Transformer` class provides the means to convert the DOM representation to the document to XML text. Get a `Transformer` object them set the document encoding and indentation.

**Lines [54-56]** Create a `StringWriter` object then transform the DOM by calling `Transformer.transform` with a `DOMSource` created from the `DOMDocument` and a `StreamResult` created from the `StringWriter` object.

### Test Application

#### Target Document

The test program will create an XML document having the same content as the `bookstore` XML file that was used in my previous blogs.

{% highlight xml %}
<bookstore>
    <book category="cooking">
        <title lang="en">Everyday Italian</title>
        <author>Giada De Laurentis</author>
        <year>2005</year>
        <price>30.00</price>
    </book>
    <book category="children">
        <title lang="en">Harry Potter and the Half-Blood Prince</title>
        <author>J. K. Rowling</author>
        <year>2005</year>
        <price>29.99</price>
    </book>
</bookstore>
{% endhighlight %}

#### Code

The test program will just build on the `ParseTest` class I used in my previous blog.

{% highlight java linenos %}
public class ParseTest {
    public static void main(String[] args) {
        ParseTest test = new ParseTest();
        try {
            // Parse the given document
            XmlDomDocument doc = new XmlDomDocument("./bookstore.xml");
            int count = doc.getChildCount("bookstore", 0, "book");
            for (int i = 0; i < count; i++) {
                System.out.println("Book "+Integer.toString(+1));
                System.out.println("book category - "+doc.getChildAttribute("bookstore", 0, "book", i, "category"));
                System.out.println("book title - "+doc.getChildValue("book", i, "title", 0));
                System.out.println("book title lang - "+doc.getChildAttribute("book", i, "title", 0, "lang"));
                System.out.println("book author - "+doc.getChildValue("book", i, "author", 0));
                System.out.println("book year - "+doc.getChildValue("book", i, "year", 0));
                System.out.println("book price - "+doc.getChildValue("book", i, "price", 0));
            }
            // Build the same document programmatically
            XmlDomDocument newdoc = new XmlDomDocument();
            newdoc.addChildElement(null, 0, "bookstore", null);
            newdoc.addChildElement("bookstore", 0, "book", null);
            newdoc.setAttributeValue("book", 0, "category", "cooking");
            newdoc.addChildElement("book", 0, "title", "Everyday Italian");
            newdoc.setAttributeValue("title", 0, "lang", "en");
            newdoc.addChildElement("book", 0, "author", "Giada De Laurentis");
            newdoc.addChildElement("book", 0, "year", "2005");
            newdoc.addChildElement("book", 0, "price", "30.00");
            newdoc.addChildElement("bookstore", 0, "book", null);
            newdoc.setAttributeValue("book", 1, "category", "children");
            newdoc.addChildElement("book", 1, "title", "Harry Potter and the Half-Blood Prince");
            newdoc.setAttributeValue("title", 1, "lang", "es");
            newdoc.addChildElement("book", 1, "author", "J. K. Rowling");
            newdoc.addChildElement("book", 1, "year", "2005");
            newdoc.addChildElement("book", 1, "price", "29.99");
            System.out.println(newdoc.renderXml());
        }
        catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
{% endhighlight %}

**Lines [18-19]** Create a new blank document then set the root node. The root node has no parent and no value.

**Lines [21-34]** Add a `book` element at index `0` and sub-elements with values. Then add another `book` element at index 1 and sub-elements with values. The bookstore element index is always `0`. Finally, convert the DOM elements to an XML stream then display the XML.

#### Build and Run

You can get the code for the project at Github – [https://github.com/vichargrave/xmldom-java.git](https://github.com/vichargrave/xmldom-java.git){:target="_blank"}. You’ll need NetBeans 7.3 to build the project. Follow these instructions to build and run the test application:

1. Right click on the **xmldom-java** project.
2, Select **Run**.

The output from ParseTest will look like this:

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
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<bookstore>
<book category="cooking">
<title lang="en">Everyday Italian</title>
<author>Giada De Laurentis</author>
<year>2005</year>
<price>30.00</price>
</book>
<book category="children">
<title lang="en">Harry Potter and the Half-Blood Prince</title>
<author>J. K. Rowling</author>
<year>2005</year>
<price>29.99</price>
</book>
</bookstore>
{% endhighlight %}
