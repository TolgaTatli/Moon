---
title: "Data PreProcessing with 'caret' - Part 2"
author: "NOWHERE"
date: "2017-07-04"
description: "This post introduces of how to use caret in R to do data preprocessing (#part 2)."
tags: [R Programming, Machine Learning, Caret, Data Preparation]
categories: [programming]
permalink: /:categories/:title
---

- [1. Introduction](#1)
- [2. Centering and Scaling](#2)
- [3. Imputing Missing Values](#3)
- [4. Transforming Predictors](#4)
- [5. General Way of Using preProcess](#5)

<h2 id="1">Introduction</h2>
In this blog, I will continue talking about the data preprocessing with the `caret` package in r. The content will cover from centering and scaling the data, imputing missing values，transforming variables, using `preProcess` generally and calculating the class distance.

<h2 id="2">Centering and Scaling</h2>
Sometimes the predictors are collected from multiple sources and they may have different units or meanings, so it is necesary to standardize such data before build model with them. `caret` offers us such function to scale and center data with `preProcess` function by setting the method as `c("center", "scale")`.

{% highlight r linenos %}
# data preparation
library(caret)
set.seed(123)
Matrix <- matrix(0, nrow = 100, ncol = 6)
Matrix[, 1] <- runif(100, 0, 100)
Matrix[, 2] <- runif(100, 0, 100)
Matrix[, 3] <- runif(100, 0, 100)
Matrix[, 4] <- runif(100, 0, 100)
Matrix[, 5] <- runif(100, 0, 100)
Matrix[, 6] <- runif(100, 0, 100)
Matrix <- data.frame(Matrix,stringsAsFactors = F)

# seperate data set into train and test
inTrain <- createDataPartition(y = Matrix$X6, p = 0.7, list = F)
training <- Matrix[inTrain,]
testing <- Matrix[-inTrain,]

# center and scale the data with preProcess, the predict function will take the actual action to change the original data
scal_cent <- preProcess(training[, -6], method = c("center", "scale"))
trainTrans <- predict(scal_cent, training[,-6])
summary(trainTrans)
       X1                 X2                 X3                 X4                X5
 Min.   :-1.75496   Min.   :-1.71918   Min.   :-1.61282   Min.   :-1.5855   Min.   :-1.5782
 1st Qu.:-0.87942   1st Qu.:-0.75800   1st Qu.:-0.88266   1st Qu.:-0.7331   1st Qu.:-0.8748
 Median :-0.08725   Median :-0.08803   Median : 0.01625   Median :-0.1466   Median :-0.0578
 Mean   : 0.00000   Mean   : 0.00000   Mean   : 0.00000   Mean   : 0.0000   Mean   : 0.0000
 3rd Qu.: 0.84940   3rd Qu.: 0.65533   3rd Qu.: 0.84572   3rd Qu.: 0.8629   3rd Qu.: 0.7131
 Max.   : 1.84226   Max.   : 1.83163   Max.   : 1.65732   Max.   : 1.7448   Max.   : 1.7328

# for each variable centered and scaled, the result is equal to <==> (trainTrans$X1 - mean(trainTrans$X1)) / sd(trainTrans$X1)
nolTrans <- (trainTrans$X1 - mean(trainTrans$X1)) / sd(trainTrans$X1)
identical(trainTrans$X1, normalTrans)
[1] TRUE

# if wants to restrict the values are centered and scaled into 0~1, then could add `ranges` key word in preProcess
scal_cent_0_1 <- preProcess(training[, -6], method = "range")
trainTrans_0_1 <- predict(scal_cent_0_1, training[, -6])
summary(trainTrans_0_1)
       X1               X2               X3               X4               X5
 Min.   :0.0000   Min.   :0.0000   Min.   :0.0000   Min.   :0.0000   Min.   :0.0000
 1st Qu.:0.2434   1st Qu.:0.2707   1st Qu.:0.2233   1st Qu.:0.2559   1st Qu.:0.2124
 Median :0.4636   Median :0.4594   Median :0.4982   Median :0.4321   Median :0.4592
 Mean   :0.4879   Mean   :0.4842   Mean   :0.4932   Mean   :0.4761   Mean   :0.4766
 3rd Qu.:0.7240   3rd Qu.:0.6687   3rd Qu.:0.7518   3rd Qu.:0.7352   3rd Qu.:0.6920
 Max.   :1.0000   Max.   :1.0000   Max.   :1.0000   Max.   :1.0000   Max.   :1.0000

# for the predictors in test set, they must be predicted by the centering and scaling model based on test data
testTrans <- predict(scal_cent, testing[,-6])
{% endhighlight %}

<h2 id="3">Imputing Missing Values</h2>
There may be certain parts of missing values in the data set, if you are familiar with r, you must heard about the `mice` package which could perfectly deal with NA values in r. In fact, the `preProcess` function in the `caret` package can also solve such problem.

{% highlight r linenos %}
library(caret)
library(dplyr)
data(airquality)
airQuality <- airquality
airQuality <- airQuality[,-c(5,6)]
sapply(airQuality, function(x) table(is.na(x)), simplify = T)
$Ozone
FALSE  TRUE
  116    37
$Solar.R
FALSE  TRUE
  146     7
$Wind
FALSE
  153
$Temp
FALSE
  153
{% endhighlight %}

As the codes shown above, there are 7 NAs in Solar.R and 37 NAs in Ozone. Let's see how to use `preProcess` to impute those missing values.

{% highlight r linenos %}
set.seed(123)
inTrain <- createDataPartition(y = airQuality$Wind, p = 0.7, list = FALSE)
training <- airQuality[inTrain,]
testing <- airQuality[-inTrain,]
ModeImpute <- preProcess(x = training[, -3], method = "knnImpute")
trainingImpute <- predict(ModeImpute, training[,-3])
sapply(trainingImpute, function(x) table(is.na(x)), simplify = F)

# now, there is no missing values in training dataset
sapply(trainingImpute, function(x) table(is.na(x)), simplify = F)
$Ozone
FALSE
  109
$Solar.R
FALSE
  109
$Temp
FALSE
  109
{% endhighlight %}

One thing is needed to be mentioned, when imputes the variables, the  `preProcess` will automatically centers and scales the variables:

{% highlight r linenos %}

head(trainingImpute)
       Ozone    Solar.R      Temp
2 -0.1826300 -0.7234566 -0.473272
4 -0.7401319  1.3587439 -1.484775
6 -0.4304086  0.5344060 -1.080174
7 -0.5852703  1.2092525 -1.181324
8 -0.7091596 -0.9263377 -1.788226
9 -1.0498553 -1.7805738 -1.585925

# verify whether variables has been centered and scaled
identical((training$Temp - mean(training$Temp)) / sd(training$Temp),trainingImpute$Temp)
[1] TRUE

# impute the missing values in testing set
testingImpute <- predict(ModeImpute, testing[,-3])
{% endhighlight %}

<h2 id="4">Transforming Predictors</h2>
With `preProcess`, it is available to transform data based on different methods, such as principal component analysis('pca'), independent component analysis('ica'), 'BoxCox' and so on. Take 'pca' as an example:

{% highlight r linenos %}
library(caret)
library(kernlab)
data(spam)
set.seed(123)
inTrain <- createDataPartition(y = spam$type, p = 0.75, list = FALSE)
training <- spam[inTrain,]
testing <- spam[-inTrain,]

# there is high correlation among predictors
kappa(cor(training[, -58]))
[1] 2823.785

# log10(training[, -58] + 1)-- make the distribution of data of each variable a little bit more like Gaussian
preProc <- preProcess(log10(training[, -58] + 1), method = "pca",thresh=0.8)
trainPC <- predict(preProc, log10(training[, -58] + 1))
# apply the training-pca model to testing
testPC <- predict(preProc, log10(testing[, -58] + 1))
trainPC$type <- training$type
testPC$type <- testing$type
modelFit <- train(type ~ ., data = trainPC, method = "glm", family = "binomial")
confusionMatrix(testing$type, predict(modelFit, testPC))
Confusion Matrix and Statistics
          Reference
Prediction nonspam spam
   nonspam     667   30
   spam         53  400
               Accuracy : 0.9278
                 95% CI : (0.9113, 0.9421)
    No Information Rate : 0.6261
    P-Value [Acc > NIR] : < 2e-16
                  Kappa : 0.8475
 Mcnemar's Test P-Value : 0.01574
            Sensitivity : 0.9264
            Specificity : 0.9302
         Pos Pred Value : 0.9570
         Neg Pred Value : 0.8830
             Prevalence : 0.6261
         Detection Rate : 0.5800
   Detection Prevalence : 0.6061
      Balanced Accuracy : 0.9283
       'Positive' Class : nonspam

# Alternative way
# modelFit <- train(type ~ ., method = "glm", preProcess = "pca", data = training, family = "binomial")
# confusionMatrix(testing$type, predict(modelFit, testing))
{% endhighlight %}

<h2 id="5">General Way of Using preProcess</h2>
After seeing all the content above in this blog and in the [last blog](https://jackho327.github.io/NOWHERE/rpr-data-preProcessing-with-caret-I/), you might be suprised about the `preProcess` could deal with so many missions. In fact, the `preProcess` could tackle such tasks at the same time.

{% highlight r linenos %}
library(AppliedPredictiveModeling)
data(schedulingData)

# the data above contains numeric and categorical predictors
str(schedulingData)
'data.frame': 4331 obs. of  8 variables:
 $ Protocol   : Factor w/ 14 levels "A","C","D","E",..: 4 4 4 4 4 4 4 4 4 4 ...
 $ Compounds  : num  997 97 101 93 100 100 105 98 101 95 ...
 $ InputFields: num  137 103 75 76 82 82 88 95 91 92 ...
 $ Iterations : num  20 20 10 20 20 20 20 20 20 20 ...
 $ NumPending : num  0 0 0 0 0 0 0 0 0 0 ...
 $ Hour       : num  14 13.8 13.8 10.1 10.4 ...
 $ Day        : Factor w/ 7 levels "Mon","Tue","Wed",..: 2 2 4 5 5 3 5 5 5 3 ...
 $ Class      : Factor w/ 4 levels "VF","F","M","L": 2 1 1 1 1 1 1 1 1 1 ...

# for esample if we want to apply Yeo-Johnson transformation on continuous predictos, then center and scale
# Yeo-Johnson transformation is a way to transform the data from non-normalized pattern into normalized pattern

pp_hpc <- preProcess(schedulingData[, -8], method = c("center", "scale", "YeoJohnson"))

# during the preprocess above, it ignored 2 categorical predictors, and did Yeo-Johnson transformation on the rest 5 predictors
pp_hpc
Created from 4331 samples and 7 variables
Pre-processing:
  - centered (5)
  - ignored (2)
  - scaled (5)
  - Yeo-Johnson transformation (5)
Lambda estimates for Yeo-Johnson transformation:
-0.08, -0.03, -1.05, -1.1, 1.44

transformed <- predict(pp_hpc, newdata = schedulingData[, -8])

head(transformed)
  Protocol  Compounds InputFields  Iterations NumPending         Hour Day
1        E  1.2289589  -0.6324538 -0.06155877  -0.554123  0.004586503 Tue
2        E -0.6065822  -0.8120451 -0.06155877  -0.554123 -0.043733214 Tue
3        E -0.5719530  -1.0131509 -2.78949011  -0.554123 -0.034967191 Thu
4        E -0.6427734  -1.0047281 -0.06155877  -0.554123 -0.964170759 Fri
5        E -0.5804710  -0.9564501 -0.06155877  -0.554123 -0.902085028 Fri
6        E -0.5804710  -0.9564501 -0.06155877  -0.554123  0.698108779 Wed

# the NumPending is highly sparse
quantile(transformed$NumPending)
       0%       25%       50%       75%      100%
-0.554123 -0.554123 -0.554123 -0.554123  2.067894

{% endhighlight %}

It's clear that the NumPending variable is very sparse, and this might be a problem in a certain statistical model.

{% highlight r linenos %}
# The variance of obs in NumPending is nearly to be ZERO
nearZeroVar(schedulingData[, -8], saveMetrics = T)
            freqRatio percentUnique zeroVar   nzv
Protocol     1.702238     0.3232510   FALSE FALSE
Compounds    3.310345    19.8106673   FALSE FALSE
InputFields  3.037037    39.9445855   FALSE FALSE
Iterations  13.117647     0.2539829   FALSE FALSE
NumPending  19.848485     6.9960748   FALSE  TRUE
Hour         1.120000    21.3345648   FALSE FALSE
Day          1.022148     0.1616255   FALSE FALSE

# add 'nzv' in the method to ask preProcess to check whether there is zero|near-zero predictors
pp_no_nzv <- preProcess(schedulingData[, -8], method = c("center", "scale", "YeoJohnson", "nzv"))

# one thing is needed to be paid attention to that there is one lines says "- removed (1)", which means the NumPending has been removed
pp_no_nzv
Created from 4331 samples and 7 variables
Pre-processing:
  - centered (4)
  - ignored (2)
  - removed (1)
  - scaled (4)
  - Yeo-Johnson transformation (4)
Lambda estimates for Yeo-Johnson transformation:
-0.08, -0.03, -1.05, 1.44

head(predict(pp_no_nzv, newdata = schedulingData[1:6, -8]))
  Protocol  Compounds InputFields  Iterations         Hour Day
1        E  1.2289589  -0.6324538 -0.06155877  0.004586503 Tue
2        E -0.6065822  -0.8120451 -0.06155877 -0.043733214 Tue
3        E -0.5719530  -1.0131509 -2.78949011 -0.034967191 Thu
4        E -0.6427734  -1.0047281 -0.06155877 -0.964170759 Fri
5        E -0.5804710  -0.9564501 -0.06155877 -0.902085028 Fri
6        E -0.5804710  -0.9564501 -0.06155877  0.698108779 Wed

{% endhighlight %}

End here, we've covered the almost basic parts of `preProcess`. Next, I will explore the train function and its control function in `caret`.