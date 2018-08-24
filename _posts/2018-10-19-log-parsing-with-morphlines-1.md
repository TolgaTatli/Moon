---
layout: post
title:  "Log Parsing with Morphlines, Part 1"
date:   2018-10-19 12:40:37
categories: Programming
tags: Morphlines Java
comments: true
feature: /assets/img/Log_Parsing_with_Morphlines.jpg
image: "/assets/img/Log_Parsing_with_Morphlines.jpg"
---
Morphlines is an open source framework that eases the development of data ingestion and parsing applications written in Java. Originally developed by Cloudera, Morphlines is part of the [Kite SDK](http://kitesdk.org){:target="_blank"} which was spun off as its own open source project. Although Morphlines was developed with the Hadoop ecosystem in mind, it can just as easily be used in any kind of program that needs to transform data in a consistent and configurable way. This is part 1 of a 2 part series that shows you how to create log parsing applications with Morphlines.

Part 1 focuses on how to write Morphlines scripts and use them to parse and map common log formats.  Part 2 will cover how to write a Morphlines parsing application.

## Morphlines Scripts

### Script Structure

The Morphlines framework enables you to read raw data in a variety of formats then parse and map tha data to specific fields with scripts written in the [HOCON language](https://github.com/lightbend/config/blob/master/HOCON.md){:target="_blank"}. If you have ever used [Logstash](https://www.elastic.co/products/logstash){:target="_blank"}, then you have already seen HOCON in action with Logstash's use of the `grok` command.  Like Logstash script files, a Morphlines script is comprised of input, parsing/mapping, and output sections:

{% highlight bash %}
morphlines : [
  {
    id : <script_id>
    importCommands : ["org.kitesdk.morphline.**"]

    commands : [   
      { 
         <input commands>
      }
      {
         <parse and map commands>
      }
      {
         <(optional) enrichmentment commands>
      }
      {
         <output command>
      }
    ]
  }
]   
{% endhighlight %}

One or more scripts are defined in the `morphlines` array. Each script must have a unique ID and include the `importCommands : ["org.kitesdk.morphline.**"]` command to load the Morphlines components that will execute the scripts. The script commands that will process data are contained in the `commands` array. Normally there is a single script defined within each file, but just know that you can define muttiple scripts per file that you reference byt their IDs.  

### JSON Parsing

JSON is the simplest form of text to parse with Morphlines because the fields consist of key-value pairs that can be laid out in any order. Let's take a look at how to parse and map fields in Twitter messages (tweets) which are JSON formatted. Here is an abbreviated tweet that will be processed: 
 
{% highlight bash %}
{
    "text": "sample tweet one",
    "retweet_count": 0,
    "retweeted": false,
    "source": "href=\"http:\/\/sample.com\"",
    "id_str": "1234567891",
    "created_at": "Wed Sep 05 01:01:01 +0000 1985",
    "favorited": false,
    "user": {
        "friends_count": 111,
        "location": "Palo Alto",
        "favourites_count": 11,
        "description": "desc1",
        "screen_name": "fake_user1",
        "statuses_count": 11111,
        "followers_count": 111,
        "name": "vichargrave",
    },
    "id": 11111112,
}
{% endhighlight %}

Tweets have a number of simple fields `user` section. One thing that can be done to make the fields a little easier to reference is to flatten this structure so that the `user` fields are at the top level with all the others. 
    
{% highlight bash linenos %}
morphlines : [
  {
    id : json
    importCommands : ["org.kitesdk.morphline.**"]

    commands : [
    {
      readJson {}
    }
    {
      extractJsonPaths {
        flatten : false
        paths : {
          id : /id
          id_str : /id_str
          text : /text
          created_at : /created_at
          retweet_count : /retweet_count
          retweeted : /retweeted
          favorited : /favorited
          source : /source
          user_friends_count : /user/friends_count
          user_favourites_count : /user/favourites_count
          user_location : /user/location
          user_description : /user/description
          user_statuses_count : /user/statuses_count
          user_followers_count : /user/followers_count
          user_name : /user/name
          user_screen_name : /user/screen_name
        }
      }
      {
        logInfo { format : "output record: {}", args : ["@{}"] }
      }
    ]
  }
]
{% endhighlight %}

**Lines [7-9]** The input section calls `readJson` to get one JSON message at a time from a stream source, then pass the block to the parsing section. Morphlines will automatically read all the lines in the stream that this script will process.

**Lines [11-12]** The `extractJsonPaths` sets up a block of commands that extract specific fields from the JSON message. 

**Lines [13-30]** Field values are expressed as paths into the JSON structure in the `path` section.  Fields like **text** and **id** ae dereferenced with a single slash preceding the field names. Fields within the **user** block, such as **location** are dereferenced like this `/user/location`. 

**Lines [32-34]** The output section just sends the newly mapped data to *stdout*.

### Syslog Parsing
The next example involves parsing syslog lines obtained from an [OSSEC](https://ossec.github.io){:target="_blank"} server, which supports syslog output.  Here are a couple of example OSSEC alert lines: 

    <132>Jul  8 10:58:09 ossec-server ossec: Alert Level: 3; Rule: 5501 - Login session opened.; Location: ossec-server->/var/log/secure; classification:  pam,syslog,authentication_success,; Jul  8 10:58:08 ossec-server su: pam_unix(su-l:session): session opened for user root by ossec(uid=0)
    <132>Jul  8 10:58:55 ossec-server ossec: Alert Level: 2; Rule: 1002 - Unknown problem somewhere in the system.; Location: ossec-server->/var/log/messages; classification:  syslog,errors,; Jul  8 10:58:54 ossec-server firefox.desktop: 1531072734810#011addons.webextension.{cd7e22de-2e34-40f0-aeff-cec824cbccac}#011WARN#011Loading extension '{cd7e22de-2e34-40f0-aeff-cec824cbccac}': Reading manifest: Error processing browser_action.theme_icons: An unexpected property was found in the WebExtension manifest.

Syslog data is only minimally structured compared to JSON. The lines generally start with a syslog priority number surrounded by `<>` characters followed by a syslog formatted date. The fields that come after are whatever the producer of the syslog wants to send. The trick to parsing such data is to use the fact that the fields are in a specific order and noticing how the keys and values are represented in the data.  Armed with this knowledge you can parse syslog lines with the Morphlines `grok` statement, which is equivalent the Logstash `grok`.

In the case of OSSEC alerts there are key-value pairs delimited by semicolons. The keys and values separated by colons.  Here is a script example that applies `grok` parsing to extract fields from OSSEC alerts: 

{% highlight bash linenos %}
include "env.conf"

morphlines: [
  {
    id : syslog
    importCommands : ["org.kitesdk.morphline.**"]

    commands : [
      {
        readLine: {
          charset: "utf-8"
        }
      }
      {
        grok {
          dictionaryFiles : [${dict_path}]
          expressions : {
            message : """<%{POSINT:syslog_pri}>%{SYSLOGTIMESTAMP:syslog_timestamp}%{SPACE}%{SYSLOGHOST:syslog_host}%{SPACE}%{DATA:syslog_program}:%{SPACE}Alert Level:%{SPACE}%{BASE10NUM:Alert_Level};%{SPACE}Rule:%{SPACE}%{BASE10NUM:Rule}%{SPACE}-%{SPACE}%{DATA:Description};%{SPACE}Location:%{SPACE}%{DATA:Details}"""
          }
          extract : true
          findSubstrings : false
          addEmptyStrings : false
        }
      }
      {
        removeFields {
          blacklist: ["literal:message", "literal:syslog_pri"]
        }
      }
      {
        logInfo { format : "output record: {}", args : ["@{}"] }
      }
    ]
  }
]
{% endhighlight %}

**Lines [1]** Includes the *env.conf* file which contains the definition of `${dict_path}` variable used in line 16.

**Lines [10-11]** The input section calls `readLine` to consume each syslog line.  The character set for incoming lines is set to UTF-8.

**Lines [15-16]** The parsing commands are contained within a `grok` section. `grok` dissects lines with regular expressions that consume one or more sets of contiguous characters then assigns each set to a variable of your choosing. 

**Lines [17-19]** The `expressions` block contains the parsing directives. `grok` consumes characters in the line to parse looking for the patterns you specify. For example, at the start of the line, `grok` is looking for `<` followed by a syslog priority value that is a positive integer value that will be assigned to the variable `syslog_pri` followed by a `>` character. The general syntax of the fields to parse is **%{field_format:field_value}**. `grok` then continues consuming characters looking for additional patterns and fields. In between each field is the `%{SPACE}` element which greedily consumes 1 or more whitespace characters without assigning them to any fields. The **field_format** directives are defined in a file with the `${dict_path}` directory. Alternatively you can specify a dictionary inline by using a `dictionaryString` section before the `expressions` statement in place of the `dictionaryFiles` statement.  Below is an example of how `POSINT` and `SPACE` would be defined.

{% highlight bash %}
dictionaryString : """
    POSINT   \b(?:[1-9][0-9]*)\b
    SPACE    \s*
  """
{% endhighlight %}

The dictionary file used for the examples in this blog is very long and comprehensive, so including the dictionary definitions inline would make the scripts unnecessarily long. Inclusion with the `dictionaryFiles` method is the easier way to go.  You get in the dictionary I used in the source code that goes with this article from the link in the next section.

**Lines [25-29]** The `message` field contains the original log line and the `syslog_pri` the syslog priority for the given log. Neither are useful after parsing, so they are dropped from the output with `removeFields { blacklist: [...] }` block.

**Lines [30-32]** Send the parsed fields to *stdout* as before. 
 
## Basic Parser Application

### Application Structure

We have all the scripts that we need to parse JSON and syslog data.  Now we need to build the application that executes these scripts and actually parses the data. The application creates a *ParserApp* class that loads our morphlines script files then loads and processes sample data files.

{% highlight java linenos %}
package io.github.vichargrave.basicparser;

import org.kitesdk.morphline.api.Command;
import org.kitesdk.morphline.api.MorphlineContext;
import org.kitesdk.morphline.api.Record;
import org.kitesdk.morphline.base.Compiler;
import org.kitesdk.morphline.base.Fields;
import org.kitesdk.morphline.base.Notifications;

import java.io.*;
import java.util.Arrays;

public class ParserApp {
    private final MorphlineContext morphlineContext;
    private final Command morphline;

    private static void usage() {
        System.out.println("usage: java ... <morphline.conf> <dataFile1> ... <dataFileN>");
        System.exit(1);
    }

    public ParserApp(File morphlineFile) {
        this.morphlineContext = new MorphlineContext.Builder().build();
        this.morphline = new Compiler().compile(morphlineFile, null, morphlineContext, null);
    }

    public boolean[] process(String[] inputs) throws IOException {
        boolean[] outcome = new boolean[inputs.length];
        // Process each input data file
        Notifications.notifyBeginTransaction(morphline);
        for (int i = 0; i < inputs.length; i++) {
            InputStream in = new BufferedInputStream(new FileInputStream(new File(inputs[i])));
            Record record = new Record();
            record.put(Fields.ATTACHMENT_BODY, in);
            Notifications.notifyStartSession(morphline);
            outcome[i] = morphline.process(record);
            if (outcome[i] == false) {
                System.out.println("Morphline failed to process record: " + record + "for file " + inputs[i]);
            }
            in.close();
        }
        Notifications.notifyShutdown(morphline);
        return outcome;
    }

    public static void main(String[] args) throws IOException {
        if (args.length < 2) {
            usage();
        }

        ParserApp app = new ParserApp(new File(args[0]));
        app.process(Arrays.copyOfRange(args, 1, args.length));
    }
}
{% endhighlight %}

**Lines [3-11]** Include the Kite SDK and Java packages we need.

**Lines [13-15]** Beginning of the ParserApp class definition, followed by declarations of `MorphlineContext` and `Command` member variables, which will be used later to create the parser.

**Lines [17-20]** The parser application accepts the path to a morphlines configuration (script) file and one or more paths to data files on the command line.  The `usage()` method displays a message to this affect if there are not enough command lines arguments when the application is run.

**Lines [22-25]** The *ParserApp* constructor creates a morphline context and then a morphline parser.  The `new Compile().compile(...)` call creates a parser given the morphline configuration file and the morphline context object. The `null` arguments correspond to a morphline ID in the script and a custom `Command` object. Neither are used in the example, but I'll have more to say about them in Part 2.  Stay tuned...

**Lines [27-28]** The `process(...)` method is the heart of the parser application. It accepts an array of paths to files to be parsed. The boolean success or fail outcomes of the attempts to parse the files are stored in a boolean array.

**Lines [31-41, 43]** Loop through the list of files to parse. Morphlines scripts ingest data from any *InputStream*. In this case there is a *BufferedInputStream* for each input file. Next a *Record* object is created to which the input stream is linked by the addition of an attachment body field. The call to `morphline.process(...)` invokes the script that was supplied to the `morphline` parser when it was created. For every file processed a separate boolean is returned indicating success or failure. We check the outcome array value in each case, reporting any failure.  Lastly, return the outcome array.  Note the parsed output will be displayed on *stdout* only.  Part 2 will cover how to get these fields into the application to do something else with them.

**Lines [46-53]** The `main(...)` routine gets the command line arguments, calling `usage()` when there is an error.  Create a `ParserApp` object with the path to the morphlines script. Call `app.process(...)` with the array of log file paths to do the parsing.

### Testing the Application

You can get the code that I use in this article from my Github location [using-morphlines](https://github.com/vichargrave/using-morphlines){:target="_blank"}. Clone or download the code then cd into the *user-morphlines* directory.

### Debugging Grok Parsing

## What's Next
