---
layout: post
title:  "Java CSV Parser Using Regular Expressions"
date:   2011-07-05 12:40:37
categories: Programming
tags: Java
comments: true
feature: /assets/img/Java_CSV_Parser_Using_Regular_Expressions.png
image: "/assets/img/Java_CSV_Parser_Using_Regular_Expressions.png"
---
Parsing files is a real pain. You can find programming tools to help, regular expressions for example, and even languages that are built for that sort of thing, like Perl.  But sooner or later you forget how to use them, unless you have a very good long term memory, in your head that is.

<!--more-->

Recently I had a *simple* job to do, parse some text values that laid out in comma separated format (CSV). The kicker was one of the fields contained cities and states separated by commas that I wanted to keep in the field. This turns out is a particularly thorny problem. I also had to do it in Java. So here’s the kind of text I was up against:

{% highlight text %}
"City,State","Population"
"Medford,OR","60,000"
"Redding,CA","75,000"
{% endhighlight %}

So in this situation I wanted to parse the quoted fields using the comma delimiters between them, but preserve the commas inside the quotes, then filter out the double quote characters.  The file parsed in this manner would look like this after inserting tabs or spaces to align the column:

{% highlight text %}
City,State Population
Medford,OR 60,000
Redding,CA 75,000
{% endhighlight %}

You might be tempted to use StringTokenizer to eliminate the commas, but in so doing you would split the fields in between the quotes.  No, the problem is more complicated than that.

The trick is to leverage the java.util.regex.Pattern class to parse each line of the CSV based on a regular expression then use the `String` `replace()` method to filter out the double quotes.  The `parseCSVLine()` method in the `ParseCSVFileExample` class shown below accomplishes this nicely.

The `main()` method reads the *example.csv* file line by line. Each line is sent to the `parseCsvLine()` method which breaks up the line into an array of fields.  Then the contents of each field are displayed.

{% highlight java linenos %}
public class ParseCSVFileExample {
    public static void main(String[] args) {
        try {
            BufferedReader input = new
            BufferedReader(new FileReader("./example.csv"));
            String line = null;

            while (( line = input.readLine()) != null) {
                String[] fields = parseCsvLine(line);
                for ( int i = 0; i < fields.length; i++ ) {
                    System.out.println(fields[i]);
                }
            }
            input.close();
        }
        catch(Exception ex) {
            System.out.println(ex.getMessage());
        }
    }

    public static String[] parseCSVLine(String line) {
        // Create a pattern to match breaks
        Pattern p =
            Pattern.compile(",(?=([^\"]*\"[^\"]*\")*(?![^\"]*\"))");
        // Split input with the pattern
        String[] fields = p.split(line);
        for (int i = 0; i < fields.length; i++) {
            // Get rid of residual double quotes
            fields[i] = fields[i].replace("\"", "");
        }
        return fields;
    }
}
{% endhighlight %}

The `parseCsvLine()` method accepts a line of input then creates a Java regular expression `Pattern` object in **[line 24]** with the given expression which does all the magic parsing. The line is split into an array of String objects with a call to the `split()` method in **[line 26]**. The regular expression used in this example does not deal with all double quotes so each field is visited to get rid of them in **[lines 27 – 30]**. Finally the array of string fields for the given line is returned to the caller.
