# data splitting with `caret`
library(caret)
data("OrchardSprays")

# training/testing sets
inTrain <- createDataPartition(y = OrchardSprays$treatment, p = 0.5,list = F)
train <- OrchardSprays[inTrain,]
test <- OrchardSprays[-inTrain,]

# bootstrap samples
reSamp <- createResample(y = OrchardSprays$treatment, times = 10, list = T)

# K-Folds data sets to do validation
kFolds <- createFolds(y = OrchardSprays$treatment,k = 10,list = T,returnTrain = T)

# time series and grouping factor based methods, just refer the "?createDataPartition"