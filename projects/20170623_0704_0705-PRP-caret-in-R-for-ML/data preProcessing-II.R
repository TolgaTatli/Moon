# data preProcessing with `caret`

## centering and scaling
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
inTrain <- createDataPartition(y = Matrix$X6, p = 0.7, list = F)
training <- Matrix[inTrain,]
testing <- Matrix[-inTrain,]

### (trainTrans$X1 - mean(trainTrans$X1)) / sd(trainTrans$X1)
scal_cent <- preProcess(training[, -6], method = c("center", "scale"))
trainTrans <- predict(scal_cent, training[, -6])
summary(trainTrans$X1)
normalTrans <- (training[, 1] - mean(training[, 1])) / sd(training[, 1])
identical(trainTrans$X1, normalTrans)

### "range" restrict the result from 0~1
scal_cent_0_1 <- preProcess(training[, -6], method = "range")
trainTrans_0_1 <- predict(scal_cent_0_1, training[, -6])
summary(trainTrans_0_1$X1)

### predictors in test set should be predict by the training set
testTrans <- predict(scal_cent, testing[, -6])

## Imputation
library(caret)
library(dplyr)
data(airquality)
airQuality <- airquality
airQuality <- airQuality[,-c(5,6)]
sapply(airQuality, function(x) table(is.na(x)), simplify = T)
set.seed(123)
inTrain <- createDataPartition(y = airQuality$Wind, p = 0.7, list = FALSE)
training <- airQuality[inTrain,]
testing <- airQuality[-inTrain,]
ModeImpute <- preProcess(x = training[, -3], method = "knnImpute")
trainingImpute <- predict(ModeImpute, training[,-3])
sapply(trainingImpute, function(x) table(is.na(x)), simplify = F)
head(trainingImpute)
testingImpute <- predict(ModeImpute, testing[,-3])

## Transforming Predictors
library(caret)
library(kernlab)
data(spam)
set.seed(123)
inTrain <- createDataPartition(y = spam$type, p = 0.75, list = FALSE)
training <- spam[inTrain,]
testing <- spam[-inTrain,]
# there is high correlation among predictors
kappa(cor(training[, -58]))
#[1] 2823.785
# log10(training[, -58] + 1)-- make data a little bit more Gaussian
preProc <- preProcess(log10(training[, -58] + 1), method = "pca",thresh=0.8)
trainPC <- predict(preProc, log10(training[, -58] + 1))
# apply the training-pca model to testing
testPC <- predict(preProc, log10(testing[, -58] + 1))
trainPC$type <- training$type
testPC$type <- testing$type
modelFit <- train(type ~ ., data = trainPC, method = "glm", family = "binomial")
confusionMatrix(testing$type, predict(modelFit, testPC))

# Alternative way
modelFit <- train(type ~ ., method = "glm", preProcess = "pca", data = training, family = "binomial")
confusionMatrix(testing$type, predict(modelFit, testing))

## Put All Together
library(AppliedPredictiveModeling)
data(schedulingData)
str(schedulingData)
pp_hpc <- preProcess(schedulingData[, -8],method = c("center", "scale", "YeoJohnson"))
pp_hpc
transformed <- predict(pp_hpc, newdata = schedulingData[, -8])
head(transformed)
quantile(transformed$NumPending)
nearZeroVar(schedulingData[, -8], saveMetrics = T)
pp_no_nzv <- preProcess(schedulingData[, -8], method = c("center", "scale", "YeoJohnson", "nzv"))
pp_no_nzv
head(predict(pp_no_nzv, newdata = schedulingData[1:6, -8]))