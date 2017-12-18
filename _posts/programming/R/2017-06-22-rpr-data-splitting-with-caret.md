---
title: "Data Splitting with 'caret'"
author: "NOWHERE"
date: "2017-06-23"
description: "This post introduces how to use caret in R to do data splitting."
tags: [R Programming, Machine Learning, Caret, Data Preparation]
categories: [programming]
permalink: /:categories/:title
---

- [1. What is 'caret'](#1)
- [2. Data Splitting](#2)
  + [2.1 Normal Way](#2.1)
  + [2.2 The caret Way](#2.2)
- [3. Coding Examples](#3)


<h2 id="1">What is 'caret'</h2>

Applying machine learning techniques to tackle business problems is not a one-simple-step process. Oppositely, it is a combination of series of complex processes which includes but not limited to collecting data, doing proper ETLs, data pre-processing, building models, evaluate the final results and balance the time, money and other resources. Thus, it is not a simple topic and in fact, it is quite complex. However, with the development of the relative techniques, we could apply pico tools to deal with this topic, and the `caret` package in R is one of such tools.

The `caret` is the abbreviation of the **Classification and Regression Training**. The package was firstly released on the [CRAN](https://cran.r-project.org/src/contrib/Archive/caret/) by <a href="mailto:mxkuhn@gmail.com"> Dr. Max Kuhn</a> and other great contributors in 2007 and the [latest version](https://cran.r-project.org/web/packages/caret/index.html) was released in April, 2017.
<br>
<img src = "https://jackho327.github.io/NOWHERE/images/20170622PRP-Caret-4-ML-in-R-Data-Splitting01.png" />
<br>

The `caret` package is very comprehensive and it can offer a certain pipline to help peole to do machine learning tasks.

Basically, it has five main features/functionalities listed below:

- Data Splitting
- Data PreProcessing
- Feature Selection
- Model Tuning and Comparison
- Variable Importance Estimation

<h2 id="2">Data Splitting</h2>
Today, I will mainly describe the **Data Splitting** feature in `caret`. We all konw that to avoid the overfitting problem during the modeling process, we need to split the original data set into several parts as:

- testing set/ training set;

or

- testing set/ training set/ validation set (if the volume of the original data is sufficiently large).

<h3 id="2.1">Normal Way</h3>
Normally, to split the original data, we could use `sample()` from the `base` package in R to randomly generate the sub-data sets we want, for example, if we want to create the training set and testing set for `airquality` data set without replacement:

{% highlight r linenos %}
data(OrchardSprays)
set.seed(123)

indexTrain <- sample(x = 1:nrow(OrchardSprays), size = 0.7*nrow(OrchardSprays),replace = FALSE)
training <- OrchardSprays[indexTrain,]
testing <- OrchardSprays[-indexTrain,]

dim(OrchardSprays)
[1] 64  4
dim(training)
[1] 44  4
dim(testing)
[1] 20  4
{% endhighlight %}

<h3 id="2.2">The caret Way</h3>
With the help of the `caret` package, doing such things will be more easily and optionally. We could do data splitting in mainly five different ways:

- createDataPartition()

> createDataPartition creates a series of test/training partitions

{% highlight r linenos %}
createDataPartition(y, times = 1, p = 0.5, list = TRUE, groups = min(5,length(y)))
{% endhighlight %}

- createResample()

> createResample creates one or more bootstrap samples

{% highlight r linenos %}
createResample(y,times = 1,p = 0.5,list = TRUE,groups=min(5,length(y)))
{% endhighlight %}

- createFolds()

> createFolds splits the data into k groups

{% highlight r linenos %}
createFolds(y, k = 10, list = TRUE, returnTrain = FALSE)
{% endhighlight %}

- createTimeSlices()

> createTimeSlices creates cross-validation split for series data

{% highlight r linenos %}
createTimeSlices(y, initialWindow, horizon = 1, fixedWindow = TRUE,
  skip = 0)
{% endhighlight %}

- groupKFold()

> groupKFold splits the data based on a grouping factor splits the data based on a grouping factor

{% highlight r linenos %}
groupKFold(group, k = length(unique(group)))
{% endhighlight %}

For the detailed definition/evaluation on args, please refer to the [R Documentation of Data Splitting functions in caret package](https://www.rdocumentation.org/packages/caret/versions/6.0-76/topics/createDataPartition).

<h2 id="3">Coding Examples</h2>
Still for the `OrchardSprays` data set:

- if you want to create its testing and training data set:

{% highlight r linenos %}
library(caret)
data(OrchardSprays)
set.seed(123)

indexTrain <- createDataPartition(y = OrchardSprays$treatment,p = 0.7,list = F)
training <- OrchardSprays[indexTrain,]
testing <- OrchardSprays[-indexTrain,]

dim(OrchardSprays)
[1] 64  4
dim(training)
[1] 48  4
dim(testing)
[1] 16  4
{% endhighlight %}

- if you want to make bootstrap samples based on a small dataset, say `mtcars`:

{% highlight r linenos %}
library(caret)
data(mtcars)
set.seed(123)

mtResamples <- createResample(y = mtcars$cyl, times = 10, list = TRUE)

# extract the data frames based on the indexes
listDtResamp <- vector(mode = "list",length = 10)
for (reSampIndex in 1:10) {
      listDtResamp[[reSampIndex]] <- mtcars[mtResamples[[1]],]
}

str(listDtResamp)
List of 10
 $ :'data.frame': 32 obs. of  11 variables:
  ..$ mpg : num [1:32] 21 21 21.4 18.7 24.4 19.2 19.2 17.8 15.2 10.4 ...
  ..$ cyl : num [1:32] 6 6 6 8 4 6 6 6 8 8 ...
  ..$ disp: num [1:32] 160 160 258 360 147 ...
  ..$ hp  : num [1:32] 110 110 110 175 62 123 123 123 180 205 ...
  ..$ drat: num [1:32] 3.9 3.9 3.08 3.15 3.69 3.92 3.92 3.92 3.07 2.93 ...
  ..$ wt  : num [1:32] 2.88 2.88 3.21 3.44 3.19 ...
  ..$ qsec: num [1:32] 17 17 19.4 17 20 ...
  ..$ vs  : num [1:32] 0 0 1 0 1 1 1 1 0 0 ...
  ..$ am  : num [1:32] 1 1 0 0 0 0 0 0 0 0 ...
  ..$ gear: num [1:32] 4 4 3 3 4 4 4 4 3 3 ...
  ..$ carb: num [1:32] 4 4 1 2 2 4 4 4 3 4 ...
{% endhighlight %}

- if you want to do cross-vaildation:

{% highlight r linenos %}
library(caret)
data(OrchardSprays)
set.seed(123)

folds <- createFolds(y = OrchardSprays$treatment, k = 10, list = TRUE, returnTrain = TRUE)

# extract the data frames based on the indexes
listDtResamp <- vector(mode = "list", length = 10)
for (reSampIndex in 1:10)
{
      listDtResamp[[reSampIndex]] <- OrchardSprays[folds[[reSampIndex]],]
}
{% endhighlight %}

The other data splitting function could be used based on the actual requirements.

### Benefits from Using `caret` to do Data Splitting
From my perspectives, the benefits of using `caret` package to split data mainly lie on two main points:

- Those data splitting functions can enhance the readability of my codes and make them more unfied, in consideration of I definitely will continuously use the other functions offered by the `caret` package to do the subsequent processes in machine learning.

- With the `caret` package I could find a relatively simpler way to generate K-Fold data sets to do cross-validation and can even separate the original data set into K parts based on the grouping factors. With such functions, I do not need to write hard codes to get there.
(In fact, there are some other simpler/more black-box look-like ways to do cross-validation, and I think I will cover them when I talk about the Data PreProcessing and Model Training in `caret` package).











