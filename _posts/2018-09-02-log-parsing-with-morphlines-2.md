---
layout: post
title:  "Log Parsing with Morphlines, Part 2"
date:   2018-09-02 12:40:37
categories: Programming
tags: Morphlines Java
comments: true
feature: /assets/img/Log_Parsing_with_Morphlines.jpg
image: "/assets/img/Log_Parsing_with_Morphlines.jpg"
---
Morphlines is an open source parsing engine that enables you to write parsing applications that can handle a wide variety of log formats.  [Part 1](/log-parsing-with-morphlines-1){:target="_blank"} of this series on log parsing with morphlines, I described how to use morphlines scripts to parse JSON and syslog formatted text streams then display the parsed fields to *stdout*.  In Part 2 I'll show you how to build a morphlines parser that returns the parse fields to the application so they can be processed according to your requirements. If you haven't read [Part 1](/log-parsing-with-morphlines-1){:target="_blank"}, you should do so before continuing because I'm going to make references to concepts covered there upon which I will not elaborate here.

## Morphlines Parser Classes

### Collector Class

In the last article recall the basic parser application defined a ParserApp class having a constructor that created a Morphlines parser as follows:

{% highlight java %}
public ParserApp(File morphlineFile) {
    this.morphlineContext = new MorphlineContext.Builder().build();
    this.morphline = new Compiler().compile(morphlineFile, null, morphlineContext, null);
}
{% endhighlight %}

The 4th argument in the compile method call accepts a reference to a Morphlines `Command` object, which was set to `null` previously.  For this version of the parser application, we will instead supply a `Collector` class object to gather up the parsed records:

{% highlight java linenos %}
package io.github.vichargrave.morphlineparser;

import java.util.ArrayList;
import java.util.List;

import org.kitesdk.morphline.base.Notifications;
import org.kitesdk.morphline.api.Command;
import org.kitesdk.morphline.api.Record;

import com.google.common.base.Preconditions;

public class Collector implements Command {

    final private List<Record> records = new ArrayList<>();

    public void reset() {
        records.clear();
    }

    @Override
    public Command getParent() {
        return null;
    }

    @Override
    public void notify(final Record notification) {
        Notifications.containsLifecycleEvent(notification, Notifications.LifecycleEvent.START_SESSION);
    }

    @Override
    public boolean process(final Record record) {
        Preconditions.checkNotNull(record);
        records.add(record);
        return true;
    }

    public List<Record> getRecords() {
        return records;
    }
}
{% endhighlight %}

**Line [12-14]** The `Collector` class implements the `Command` interface.  `records` is the List in which the parsed fields are collected while parsing which is created when the `Collector` is created. Records are added during parsing and cleared before each parsing run.

**Lines [16-18]** The parser object developed in the next section enables you parse multiple log payloads with a single Morphlines script. The `reset()` method must be called prior to each parsing run to clear the list of parsed records.

**Lines [20-23]** The parent is not being tracked so just return `null` when the Morphlines framework calls this method.

**Lines [25-28]** The `notity()` method is called by the Morphlines engine when a parsing session starts, which calls `Notifications.containsLifecycleEvent` to indicate the start of a parsing session.

**Lines [30-35]** The `process()` method is called by Morphlines to add parsed records to the list. This process continues until all the records are parsed.

**Lines [37-39]** `getRecords()` returns the list of parsed records.

### Morphlines Parser Class

Armed with a mechanism to collect parsed records, the next step is to create a class to load Morphlines scripts and parse log lines. 

{% highlight java linenos %}
package io.github.vichargrave.morphlineparser;

import java.io.*;
import java.util.List;

import org.apache.solr.common.util.ContentStreamBase;
import org.kitesdk.morphline.api.Command;
import org.kitesdk.morphline.api.MorphlineContext;
import org.kitesdk.morphline.api.Record;
import org.kitesdk.morphline.base.Compiler;
import org.kitesdk.morphline.base.Fields;
import org.kitesdk.morphline.base.Notifications;

public class MorphlineParser {
    final private Collector collector = new Collector();
    final private Command morphline;

    public MorphlineParser(final String morphlineFile) {
        morphline = new Compiler().compile(new File(morphlineFile),
                null,
                new MorphlineContext.Builder().build(),
                collector);
    }

    public MorphlineParser(final String morphlineFile, final String morphlineId) {
        morphline = new Compiler().compile(new File(morphlineFile),
                morphlineId,
                new MorphlineContext.Builder().build(),
                collector);
    }

    private List<Record> parse(final InputStream in) {
        collector.reset();
        final Record record = new Record();
        record.put(Fields.ATTACHMENT_BODY, in);
        Notifications.notifyStartSession(morphline);
        morphline.process(record);
        return collector.getRecords();
    }

    public List<Record> parse(final File fileToParse) throws FileNotFoundException {
        final InputStream in = new BufferedInputStream(new FileInputStream(fileToParse));
        return parse(in);
    }

    public List<Record> parse(final String linesToParse) throws IOException {
        final ContentStreamBase.StringStream stream = new ContentStreamBase.StringStream(linesToParse);
        final InputStream in = stream.getStream();
        return parse(in);
    }
}
{% endhighlight %}

**Lines [14-16]**  The `MorphlineParser` class encapsulates the mechanisms to read and parse lines from an InputStream, collect the parsed records and return them to the caller.  There are two private member objects, `Collector collector` and `Command morphline`.  The latter is the Morphlines parser that is created in the class constructors. 

**Lines [18-23]** The first constructor creates a `morphline` parser object from the file specified in `morphlineFile`.  The call to `Compiler().compile()` takes four arguments:

**Lines [25-30]** 

**Lines [32-39]** 

**Lines [41-44]** 

**Lines [46-50]**  

## Parser Application

### Application Code

{% highlight java linenos %}
package io.github.vichargrave.morphlineparser;

import org.kitesdk.morphline.api.MorphlineCompilationException;
import org.kitesdk.morphline.api.Record;

import java.io.*;
import java.util.List;

public class ParserApp {

    private static void usage() {
        System.out.println("usage: java ... <morphline conf> <data file> <morphline ID>");
        System.exit(1);
    }

    public static void main(String[] args) {
        if (args.length != 3) {
            usage();
        }

        try {
            MorphlineParser parser = new MorphlineParser(args[0], args[2]);
            List<Record> records = parser.parse(new File(args[1]));
            if (records.size() > 0) {
                for (Record record : records) {
                    System.out.println(record.toString());
                }
            }
            else {
                System.out.println("No parsed records produced");
                System.exit(-1);
            }
        }
        catch (FileNotFoundException ex) {
            System.out.println(ex.getMessage());
            System.exit(-1);
        }
    }
}
{% endhighlight %}

### Testing the Application

### Unit Testing

## Summing Up

