---
title: "Data PreProcessing with 'caret' - Part 1"
author: "NOWHERE"
date: "2017-06-23"
description: "This post introduces of how to use caret in R to do data preprocessing (#part 1)."
tags: [R Programming, Machine Learning, Caret, Data Preparation]
categories: [programming]
permalink: /:categories/:title
---

- [1. Introduction](#1)
- [2. Data PreProcessing](#2)
- [3. Data Cleaning](#3)
  + [3.1 Create Dummy Variables](#3.1)
  + [3.2 Find Zero- and Near Zero-Variance Predictors](#3.2)
  + [3.3 Identify Correlated Predictors](#3.3)
  + [3.4 Linear Dependencies](#3.4)

<h2 id="1">Introduction</h2>
In the last blog, I've talked about how to do [Data Splitting with 'caret'](https://jackho327.github.io/NOWHERE/rpr-data-splitting-with-caret/). In this blog I will talk about how to pre-process your data with the `caret` package in r.

<h2 id="2">Data PreProcessing</h2>
During the process of learning data mining or machine learning, people should hear about "garbage in, garbage out", the words relfect the importance of getting the **proper** data before apply them to a certain model. Normally, data pre-processing contains several aspects, which are listed below:

- Data Cleaning
- Data Integration
- Data Reduction
- Data Transformation
<br>
<img  align="middle" src = "https://2.bp.blogspot.com/-ITJ538FW9YY/UxWea2v1X7I/AAAAAAAAACs/Z6DJkzrClVY/s1600/dm1.JPG"/>
<br>
The above four parts of data pre-processing section may be included into a completed data mining or machine learning work flow based on actual requirements and the status of data.

<h2 id="3">Data Cleaning</h2>
> Data cleansing or data cleaning is the process of detecting and correcting (or removing) corrupt or inaccurate records from a record set, table, or database and refers to identifying incomplete, incorrect, inaccurate or irrelevant parts of the data and then replacing, modifying, or deleting the dirty or coarse data. Data cleansing may be performed interactively with data wrangling tools, or as batch processing through scripting.

<h3 id="3.1">Create Dummy Variables</h3>
Under certain situations, some variables should be modified as dummy variables in order to improve the accuracy of the model.  `dummyVars` can help to create dummy variables.
> dummyVars(formula, data, sep = ".", levelsOnly = FALSE,
  fullRank = FALSE, ...)

{% highlight r linenos %}
library(dplyr)
library(caret)

# the head of the data carsdt
head(carsdt)
                  mpg   disp hp   wt  qsec  ownerGender
Mazda RX4         21.0  160 110 2.620 16.46           M
Mazda RX4 Wag     21.0  160 110 2.875 17.02           M
Datsun 710        22.8  108  93 2.320 18.61          FM
Hornet 4 Drive    21.4  258 110 3.215 19.44          FM
Hornet Sportabout 18.7  360 175 3.440 17.02           M
Valiant           18.1  225 105 3.460 20.22          FM

dummGender <- dummyVars(formula = mpg ~ ., data = carsdt)
dummyMatri <- predict(dummGender,carsdt)
head(dummyMatri)
                  disp  hp    wt  qsec ownerGender.FM ownerGender.M
Mazda RX4          160 110 2.620 16.46              0             1
Mazda RX4 Wag      160 110 2.875 17.02              0             1
Datsun 710         108  93 2.320 18.61              1             0
Hornet 4 Drive     258 110 3.215 19.44              1             0
Hornet Sportabout  360 175 3.440 17.02              0             1
Valiant            225 105 3.460 20.22              1             0

# however, gender is a binary variable-- femal or male, so in fact only one dummy gender predictor is needed (in order to reduce the complexity and correlation)
cor(dummyMatri$ownerGender.FM, dummyMatri$ownerGender.M)
[1] -1

# the `fullRank` parameter in `dummyVars` could solve this problem
dummGender <- dummyVars(formula = mpg ~ ., data = carsdt,fullRank=T)
dummyMatri <- data.frame(predict(dummGender, carsdt),stringsAsFactors = F)
head(dummyMatri)
                  disp  hp    wt  qsec ownerGender.M
Mazda RX4          160 110 2.620 16.46             1
Mazda RX4 Wag      160 110 2.875 17.02             1
Datsun 710         108  93 2.320 18.61             0
Hornet 4 Drive     258 110 3.215 19.44             0
Hornet Sportabout  360 175 3.440 17.02             1
Valiant            225 105 3.460 20.22             0
{% endhighlight %}


<h3 id="3.2">Find Zero- and Near Zero-Variance Predictors</h3>
Sometimes the most of observations of predictors lie in the same value. If include such predictors into model, the results will be biased and unstable. `nearZeroVar` can help to detect those zero- and near zero-variance predictors.
> nearZeroVar(x, freqCut = 95/5, uniqueCut = 10, saveMetrics = FALSE,
  names = FALSE, foreach = FALSE, allowParallel = TRUE)

{% highlight r linenos %}
library(caret)
library(dplyr)
data(mtcars)
# here, the mtcars has no zero- and near zero-variance predictors.
nearZeroVar(mtcars, saveMetrics = T)
     freqRatio percentUnique zeroVar   nzv
mpg   1.000000        78.125   FALSE FALSE
cyl   1.272727         9.375   FALSE FALSE
disp  1.500000        84.375   FALSE FALSE
hp    1.000000        68.750   FALSE FALSE
drat  1.000000        68.750   FALSE FALSE
wt    1.500000        90.625   FALSE FALSE
qsec  1.000000        93.750   FALSE FALSE
vs    1.285714         6.250   FALSE FALSE
am    1.461538         6.250   FALSE FALSE
gear  1.250000         9.375   FALSE FALSE
carb  1.000000        18.750   FALSE FALSE

# then, change all the am values in mtcars to 1
mtcars$am <- 1
nearZeroVar(mtcars, saveMetrics = T)
     freqRatio percentUnique zeroVar   nzv
mpg   1.000000        78.125   FALSE FALSE
cyl   1.272727         9.375   FALSE FALSE
disp  1.500000        84.375   FALSE FALSE
hp    1.000000        68.750   FALSE FALSE
drat  1.000000        68.750   FALSE FALSE
wt    1.500000        90.625   FALSE FALSE
qsec  1.000000        93.750   FALSE FALSE
vs    1.285714         6.250   FALSE FALSE
am    0.000000         3.125    TRUE  TRUE
gear  1.250000         9.375   FALSE FALSE
carb  1.000000        18.750   FALSE FALSE

# exclude `am` and the `am` variable will be removed
mtcars %>% select(-nearZeroVar(mtcars)) %>% head
mpg cyl disp  hp drat    wt  qsec vs gear carb
Mazda RX4         21.0   6  160 110 3.90 2.620 16.46  0    4    4
Mazda RX4 Wag     21.0   6  160 110 3.90 2.875 17.02  0    4    4
Datsun 710        22.8   4  108  93 3.85 2.320 18.61  1    4    1
Hornet 4 Drive    21.4   6  258 110 3.08 3.215 19.44  1    3    1
Hornet Sportabout 18.7   8  360 175 3.15 3.440 17.02  0    3    2
Valiant           18.1   6  225 105 2.76 3.460 20.22  1    3    1
{% endhighlight %}

<h3 id="3.3">Identify Correlated Predictors</h3>

Under certain contexts, predictors may have high correlations among each other, and such highly postive or negative relationships will harm the accuracy and performance of the model. Thus, it is necessary to detect thsoe highly correlated predictors and exclude them out of the model. Basically, we will treat the value of correlation between two variables is higher than 0.75 or lower than -0.75 as high correlation. In the `caret` package, there is a function called `findCorrelation` to find the high correlated variables.
> findCorrelation(x, cutoff = 0.9, verbose = FALSE, names = FALSE,
  exact = ncol(x) < 100)

{% highlight r linenos %}
library(caret)
library(dplyr)
data(mtcars)
predCors <- cor(mtcars)
# check the correlation matrix
predCors
            mpg        cyl       disp         hp        drat         wt        qsec         vs          am       gear        carb
mpg   1.0000000 -0.8521620 -0.8475514 -0.7761684  0.68117191 -0.8676594  0.41868403  0.6640389  0.59983243  0.4802848 -0.55092507
cyl  -0.8521620  1.0000000  0.9020329  0.8324475 -0.69993811  0.7824958 -0.59124207 -0.8108118 -0.52260705 -0.4926866  0.52698829
disp -0.8475514  0.9020329  1.0000000  0.7909486 -0.71021393  0.8879799 -0.43369788 -0.7104159 -0.59122704 -0.5555692  0.39497686
hp   -0.7761684  0.8324475  0.7909486  1.0000000 -0.44875912  0.6587479 -0.70822339 -0.7230967 -0.24320426 -0.1257043  0.74981247
drat  0.6811719 -0.6999381 -0.7102139 -0.4487591  1.00000000 -0.7124406  0.09120476  0.4402785  0.71271113  0.6996101 -0.09078980
wt   -0.8676594  0.7824958  0.8879799  0.6587479 -0.71244065  1.0000000 -0.17471588 -0.5549157 -0.69249526 -0.5832870  0.42760594
qsec  0.4186840 -0.5912421 -0.4336979 -0.7082234  0.09120476 -0.1747159  1.00000000  0.7445354 -0.22986086 -0.2126822 -0.65624923
vs    0.6640389 -0.8108118 -0.7104159 -0.7230967  0.44027846 -0.5549157  0.74453544  1.0000000  0.16834512  0.2060233 -0.56960714
am    0.5998324 -0.5226070 -0.5912270 -0.2432043  0.71271113 -0.6924953 -0.22986086  0.1683451  1.00000000  0.7940588  0.05753435
gear  0.4802848 -0.4926866 -0.5555692 -0.1257043  0.69961013 -0.5832870 -0.21268223  0.2060233  0.79405876  1.0000000  0.27407284
carb -0.5509251  0.5269883  0.3949769  0.7498125 -0.09078980  0.4276059 -0.65624923 -0.5696071  0.05753435  0.2740728  1.00000000

# use findCorrelation() to find out highly correlated predictors
highCors <- findCorrelation(predCors, cutoff = 0.7, verbose = T)
Compare row 2  and column  3 with corr  0.902
  Means:  0.701 vs 0.546 so flagging column 2
Compare row 3  and column  1 with corr  0.848
  Means:  0.658 vs 0.513 so flagging column 3
Compare row 1  and column  6 with corr  0.868
  Means:  0.63 vs 0.483 so flagging column 1
Compare row 6  and column  5 with corr  0.712
  Means:  0.543 vs 0.455 so flagging column 6
Compare row 4  and column  8 with corr  0.723
  Means:  0.5 vs 0.418 so flagging column 4
Compare row 8  and column  7 with corr  0.745
  Means:  0.426 vs 0.398 so flagging column 8
Compare row 5  and column  9 with corr  0.713
  Means:  0.399 vs 0.365 so flagging column 5
Compare row 9  and column  10 with corr  0.794
  Means:  0.36 vs 0.352 so flagging column 9
All correlations <= 0.7

# exclude highly correlated predictors, and most extremly high correlation predictors have gone
dtCors <- predCors[, - highCors]
dtCors
            qsec       gear        carb
mpg   0.41868403  0.4802848 -0.55092507
cyl  -0.59124207 -0.4926866  0.52698829
disp -0.43369788 -0.5555692  0.39497686
hp   -0.70822339 -0.1257043  0.74981247
drat  0.09120476  0.6996101 -0.09078980
wt   -0.17471588 -0.5832870  0.42760594
qsec  1.00000000 -0.2126822 -0.65624923
vs    0.74453544  0.2060233 -0.56960714
am   -0.22986086  0.7940588  0.05753435
gear -0.21268223  1.0000000  0.27407284
carb -0.65624923  0.2740728  1.00000000
{% endhighlight %}

<h3 id="3.4">Linear Dependencies</h3>

Similar to identify correlated predictors, the `caret` package also provide `findLinearCombos` to enumerate sets of linear combinations by QR decomposition of the input matrix.
{% highlight r linenos %}
# create a matrix which has severe linearity
set.seed(123)
linearMatrix <- matrix(0, nrow = 6, ncol = 6)
linearMatrix[, 1] <- runif(6, 0, 1)
linearMatrix[, 2] <- runif(6, 0, 1)
linearMatrix[, 3] <- linearMatrix[, 1] + linearMatrix[, 2]
linearMatrix[, 4] <- linearMatrix[, 1] + linearMatrix[, 3]
linearMatrix[, 5] <- linearMatrix[, 3] + linearMatrix[, 2]
linearMatrix[, 6] <- linearMatrix[, 1] - linearMatrix[, 2]
linearVars <- findLinearCombos(linearMatrix)

linearVars
$linearCombos
$linearCombos[[1]]
[1] 3 1 2
$linearCombos[[2]]
[1] 4 1 2
$linearCombos[[3]]
[1] 5 1 2
$linearCombos[[4]]
[1] 6 1 2
$remove
[1] 3 4 5 6

# drop linearity parts
newMatrix <- linearMatrix[,-linearVars$remove]
newMatrix
         [,1]      [,2]
[1,] 0.2875775 0.5281055
[2,] 0.7883051 0.8924190
[3,] 0.4089769 0.5514350
[4,] 0.8830174 0.4566147
[5,] 0.9404673 0.9568333
[6,] 0.0455565 0.4533342
{% endhighlight %}