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

In the last article recall the basic parser application defined a ParserApp class having a constructor that initialized created a Morphlines parser as follows:

{% highlight java %}
public ParserApp(File morphlineFile) {
    this.morphlineContext = new MorphlineContext.Builder().build();
    this.morphline = new Compiler().compile(morphlineFile, null, morphlineContext, null);
}
{% endhighlight %}

The 4th argument in the compile method call accepts a reference to a Morphlines `Command` object, was set to `null` previously.  To get the parsed fields up into the parser application, requires implementing a `Command` interface object designed to collect the parsed fields into a List.  The `Collector` class below satisfys that requirement.

{% highlight java linenos %}
package io.github.vichargrave.morphlineparser;

import java.util.ArrayList;
import java.util.List;

import org.kitesdk.morphline.base.Notifications;
import org.kitesdk.morphline.api.Command;
import org.kitesdk.morphline.api.Record;

import com.google.common.base.Preconditions;

public class Collector implements Command {

    private Command parent;
    private List<Record> records;

    public Collector() {
        reset();
    }

    public void reset() {
        records = new ArrayList<Record>();
    }

    @Override
    public Command getParent() {
        return parent;
    }

    @Override
    public void notify(Record notification) {
        Notifications.containsLifecycleEvent(notification, Notifications.LifecycleEvent.START_SESSION);
    }

    @Override
    public boolean process(Record record) {
        Preconditions.checkNotNull(record);
        records.add(record);
        return true;
    }

    public List<Record> getRecords() {
        return records;
    }
}
{% endhighlight %}

**Line [12-15]** The `Collector` class implements the `Command` interface.  The`parent` object is required to interact with the Morphlines framework. `records` is the List in which the parsed fields are collected while parsing. 

**Lines [17-23]** The constructor simply calls the `reset` method to create a new empty list. This enables the class to be reused to collect a series of parsing runs.

**Lines [25-28]** The `getParent` method is required override that returns the parent `Command`. 

**Lines [30-33]**

**Lines [35-40]**

**Lines [42-44]**


### Morphlines Parser Class

{% highlight java linenos %}
package io.github.vichargrave.morphlineparser;

import java.io.*;
import java.util.List;

import org.apache.solr.common.util.ContentStreamBase;
import org.kitesdk.morphline.api.Command;
import org.kitesdk.morphline.api.MorphlineCompilationException;
import org.kitesdk.morphline.api.MorphlineContext;
import org.kitesdk.morphline.api.Record;
import org.kitesdk.morphline.base.Compiler;
import org.kitesdk.morphline.base.Fields;
import org.kitesdk.morphline.base.Notifications;

public class MorphlineParser {
    private Collector collector;
    private MorphlineContext morphlineContext;
    private File morphlineFile;
    private String morphlineId;
    private Command morphline;

    public MorphlineParser(String morphlineFile) {
        collector = new Collector();
        this.morphlineFile = new File(morphlineFile);
        this.morphlineId = null;
    }

    public MorphlineParser(String morphlineFile, String morphlineId) {
        collector = new Collector();
        this.morphlineFile = new File(morphlineFile);
        this.morphlineId = morphlineId;
    }

    private void createMorphline() throws MorphlineCompilationException {
        morphlineContext = new MorphlineContext.Builder().build();
        morphline = new Compiler().compile(morphlineFile, morphlineId, morphlineContext, collector);
    }

    /** Parses lines from any InputStream. The other two parse methods call this one. */
    public List<Record> parse(InputStream in) {
        collector.reset();
        createMorphline();
        Record record = new Record();
        record.put(Fields.ATTACHMENT_BODY, in);
        Notifications.notifyStartSession(morphline);
        morphline.process(record);
        return collector.getRecords();
    }

    /** Parses all the lines in a file. */
    public List<Record> parse(File fileToParse) throws FileNotFoundException {
        InputStream in = new BufferedInputStream(new FileInputStream(fileToParse));
        return parse(in);
    }

    /** Parse 1 or more lines in a String buffer. */
    public List<Record> parse(String linesToParse) throws IOException {
        ContentStreamBase.StringStream stream = new ContentStreamBase.StringStream(linesToParse);
        InputStream in = stream.getStream();
        return parse(in);
    }
}
{% endhighlight %}

**Lines [15-20]**


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
        catch (MorphlineCompilationException ex) {
            System.out.println(ex.getMessage());
            System.exit(-1);
        }
    }
}
{% endhighlight %}

### Testing the Application

### Unit Testing

## Morphlines vs Logstash

