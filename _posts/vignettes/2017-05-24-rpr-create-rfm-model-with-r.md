---
title: 'Build RFM Model with R'
author: "NOWHERE"
date: "2017-05-24"
description: "This post is about to introduce the RFM Model, which is frequently used in customer analysis, and give a demo about implementation with R."
tags: [R Programing, RFM Model]
categories: [vignettes]
permalink: /:categories/:title
---

[1. What is RFM Model](#1)
[2. Build the RFM Model](#2)
[3. R Codes](#3)

<h2 id="1">What is RFM</h2>

[RFM Model](https://en.wikipedia.org/wiki/RFM_(customer_value)) is a classic model which is frequently used in [database marketing](https://en.wikipedia.org/wiki/Database_marketing) and [direct marketing](https://en.wikipedia.org/wiki/Direct_marketing) to anlayze the **customer value**.

"RFM" respectively represents for three objects:

- "R" for **Recency**: How recently the customers buy the products? The closer/smaller, the better.

- "F" for **Frequency**: How often do customers buy products? The larger/more frequently, the better.

- "M" for **Monetary**: How much money do they spend? The larger/more, the better.

<br>
<img src = "https://jackho327.github.io/NOWHERE/images/20170524RPR-Build-RFM-Model-with-R-01.png" />
<br>

Based on the three variables above, merchants could allocate their customers into certain levels, usually it could be 10 levels or 5 levels.

<h2 id="2">Build the RFM Model</h2>

Nowadays, it is easy for retailers to get the pruchasing records about their customers.
Retailers extract the data from the data warehouse:

- Get R: calculate the nearest date when the customer made the latest purchase, get the differences between that date and the current date (or a certain date people defined) and then scale the differences into 5 or 10 levels.

- Get F: count the frequency of the occurrences about every customers' records and scale the frequency into 5 or 10 levels in that period.

- Get M: sum all the money corresponding to every customer in that period.

- Weight these three variables and calculate the whole score corresponding customers.

For one customer_i, his/her final score will be:

<img src="http://chart.googleapis.com/chart?cht=tx&chl=Score_{customer_i} = Weight_{R_i} \times Scale_{R_i}%2BWeight_{F_i} \times Scale_{F_i}%2BWeight_{M_i} \times Scale_{M_i}" style="border:none;">

- Categorize customers into 10 or 5 levels based on their scores.

<h2 id="3">R Codes</h2>

{% highlight r linenos %}
# load libraries
library(dplyr, quietly = T)
library(XLConnect, quietly = T)
library(ggplot2, quietly = T)

# load the dataset
rfm_data <- readWorksheet(object = loadWorkbook("../datasets/2017-05-24-RPR-Build-RFM-Model-with-R-01.xlsx"),sheet = 1,header = T)
# check first 6 records
head(rfm_data, 6) %>% knitr::kable()
{% endhighlight %}

<br>
<img src = "https://jackho327.github.io/NOWHERE/images/20170524RPR-Build-RFM-Model-with-R-02.png" />
<br>

There are 995 customers in the dataset. Here, I set the level as 5, which means the customers will be seperated into 5 groups and the customers with the highest level will be located in group 5.

{% highlight r linenos %}
# calculate "R"
rfm_data$Date <- as.Date(rfm_data$Date)
nearestDate <- aggregate(x = rfm_data$Date, by = list(rfm_data$ID), max)
nearestDate$diffDate <- as.numeric(Sys.Date() - nearestDate$x)
nearestDate$Recency <- cut(x = 1/nearestDate$diffDate, breaks = 5,labels = F)
names(nearestDate)[1:2] <- c("ID","NearestDate")
# head(nearestDate, 6) %>% knitr::kable()

# calculate "F"
freq <- table(rfm_data$ID) %>% as.data.frame()
names(freq)[1] <- "ID"
freq$Frequency <- cut(x = freq$Freq, breaks = 5, labels = F)
# head(freq, 6) %>% knitr::kable()

# calculate "M"
monetary <- aggregate(x = rfm_data$Amount , by = list(rfm_data$ID), sum)
names(monetary)[1:2] <- c("ID","SumAmount")
monetary$Monetary <- cut(x = monetary$SumAmount, breaks = 5, labels = F)
# head(monetary, 6) %>% knitr::kable()

# get the merged rfm data
rfm_merge <- merge(x= merge(x = freq,y = monetary,by = "ID"), y = nearestDate, by = "ID") %>% select(ID, Recency, Frequency, Monetary)

# calculate scores and levels
# set the weights: 50, 30, 20 as an example.
rfm_merge$Score <- 50 * rfm_merge$Recency + 30 * rfm_merge$Frequency + 20 * rfm_merge$Monetary
rfm_merge$ScoreLevel <- cut(x = rfm_merge$Score, breaks = 5, labels = F)

rfm_merge <- rfm_merge %>% arrange(ID)
# check first 6 rows for the final rfm model
head(rfm_merge, 6) %>% knitr::kable()
{% endhighlight %}

<br>
<img src = "https://jackho327.github.io/NOWHERE/images/20170524RPR-Build-RFM-Model-with-R-03.png" />
<br>
The above table showed part of the data in the final dataset.

{% highlight r linenos %}
rfm_merge$ScoreLevel <- as.factor(rfm_merge$ScoreLevel)
ggplot(data = rfm_merge, aes(x = ScoreLevel, fill = ScoreLevel)) + geom_bar(stat = 'count') + ggtitle(label = "Distribution of Level of Customers' Values") + xlab(label = "Levels of Customers' Values")
{% endhighlight %}

<br>
<img src = "https://jackho327.github.io/NOWHERE/images/20170524RPR-Build-RFM-Model-with-R-04.png" />
<br>

From the chart above, most customers are located in level 2, 3 and 4. The company at least motivate those customers in group 1, 2 and 3 to 4 or 5.




