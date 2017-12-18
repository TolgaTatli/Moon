# data preProcessing with `caret`

## dummy variables
library(caret)
library(dplyr)
carsdt <- mtcars %>% select(1,3, 4, 6, 7, 8)
carsdt <- carsdt %>% rename(ownerGender = vs)
carsdt$ownerGender[which(carsdt$ownerGender == 0)] <- "M"
carsdt$ownerGender[which(carsdt$ownerGender == 1)] <- "FM"
carsdt$ownerGender <- as.factor(carsdt$ownerGender)
head(carsdt)
dummGender <- dummyVars(formula = mpg ~ ., data = carsdt,fullRank=T)
dummyMatri <- data.frame(predict(dummGender, carsdt),stringsAsFactors = F)
head(dummyMatri)

## zero- and near zero-variance variables
library(caret)
library(dplyr)
data(mtcars)
nearZeroVar(mtcars, saveMetrics = T)
mtcars$am <- 1
nearZeroVar(mtcars, saveMetrics = T)
mtcars %>% select(-nearZeroVar(mtcars)) %>% head

## identify correlation
library(caret)
library(dplyr)
data(mtcars)
predCors <- cor(mtcars)
predCors
highCors <- findCorrelation(predCors, cutoff = 0.7,verbose = T)
dtCors <- predCors[, - highCors]
dtCors

## linear dependencies
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
newMatrix <- linearMatrix[,-linearVars$remove]
newMatrix

## centering and scaling
