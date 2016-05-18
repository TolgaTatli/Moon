---
layout: post
title: "Crunching Text With A GroupBy"
date: 2012-05-16
excerpt: "My first post!"
tags: [sample post, readability, test]
comments: true
---
Test code below:

{% highlight Python %}
import pandas as pd
import sys
import numpy as np

path = "C:/Users/James Fung/Desktop/VBA Projects/SunTrust Vacant Props Service Check/suntrust messages.csv"
path2 = "C:/Users/James Fung/Desktop/VBA Projects/SunTrust Vacant Props Service Check/grouped msg.csv"

def merge():
    messages = pd.read_csv(path, header = 0)
    messages = messages[['Customer Case','Contents']]
    messages = messages.astype(str)
    messages = messages.groupby(['Customer Case'])['Contents'].apply(lambda x: ','.join(x)).reset_index()
    messages.to_csv(path2, header = 0)
    for i in np.arange(101):
        sys.stdout.write("\r%d%%" % i)
    print("Complete!")

if __name__ == '__main__':
    merge()
{% endhighlight %}

Test table below:

|Player|Position|Tm|	Output|	Salary|	Opponent|
|:-----|:------:|::||:-------:|:------|-------:|
|Paul George|SF|IND	|139.900|	45|	PHI|
|LeBron James|SF|CLE|	125.825	|52	|DEN|
|Draymond Green|PF|GSW	|125.660|	42|	0|
|LaMarcus Aldridge|PF|SAS|	102.900	|36|	0|
|Klay Thompson|SG|GSW|	100.940|	36|	0|

Test formula below:

\\[ y_x = \alpha + \beta_1 x_1 + \beta_2 x_2 + \beta_3 x_3 \\]
