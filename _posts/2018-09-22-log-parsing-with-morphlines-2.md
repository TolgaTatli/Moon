---
layout: post
title:  "Log Parsing with Morphlines, Part 2"
date:   2018-09-22 12:40:37
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
        return parse(new BufferedInputStream(new FileInputStream(fileToParse)));
    }

    public List<Record> parse(final String linesToParse) throws IOException {
        return parse(new ByteArrayInputStream(linesToParse.getBytes()));
    }
}
{% endhighlight %}

**Lines [14-16]**  The `MorphlineParser` class encapsulates the mechanisms to read and parse lines from an InputStream, collect the parsed records and return them to the caller.  There are two private member objects, `Collector collector` and `Command morphline`.  The latter is the Morphlines parser that is created in the class constructors. The `Collector` object is created when the member variable is declared.

**Lines [18-23]** The first constructor creates a `morphline` parser object from the file specified in `morphlineFile`.  The call to `Compiler().compile()` takes four arguments:

   1. Path to the Morphlines script file.
   2. ID of the script to be compiled, which is set to `null` meaning the first script found in the script file will be used.
   3. Morphline context that is built on the fly.
   4. `Command` object, in this case the `Collector`. 

**Lines [25-30]** The second constructor accepts two arguments: a path to the Morphlines script and a script ID.  The call to `Compiler().compile()` is the same except the second argument will be set to the script ID passed into the constructor.

**Lines [32-39]** The private `parse()` method is the heart of the `MorphlineParser` class.  It takes an `InputStream` object then immediately clears the current contents of the `collector`, if any.  The stream is attached to a new `Record` object by adding it as a field with the key `Fields.ATTACHMENT_BODY`.  After the parsing session start notification is sent, `morphlines.parse()` is called to read and parse the line read from the stream.  After each record is parsed, Morphlines calls `Collector#process()` to add the record to the list of parsed records.  Then parsing is done the list is returned to the caller.

**Lines [41-43]** The second version of `parse()` takes a `File` object argument, converts it to a `FileInputStream`, then calls the private `parse()` method to parse the records from the stream.

**Lines [45-47]** Thie third version of `parse()` takes a `String` object containing one or more lines, converts it `a ByteArrayStream`, then calls the private `parse()` method.

## Parser Application

### Application Code

Now let's combine all the ingredients to build the parsing application.

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

**Lines [11-14]** 

**Lines [16-19]**

**Lines [21-33]** 

**Lines [34-37]** 

### Testing the Application

### Unit Testing

## Summing Up

