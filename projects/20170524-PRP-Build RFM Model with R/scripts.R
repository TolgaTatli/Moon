# load libraries
library(dplyr, quietly = T)
library(XLConnect, quietly = T)
library(ggplot2, quietly = T)

# load the dataset
rfm_data <- readWorksheet(object = loadWorkbook("../../datasets/2017-05-24-RPR-Build-RFM-Model-with-R-01.xlsx"),sheet = 1,header = T)
# check first 6 records
head(rfm_data, 6) %>% knitr::kable()

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

rfm_merge$ScoreLevel <- as.factor(rfm_merge$ScoreLevel)
ggplot(data = rfm_merge, aes(x = ScoreLevel, fill = ScoreLevel)) + geom_bar(stat = 'count') + ggtitle(label = "Distribution of Level of Customers' Values") + xlab(label = "Levels of Customers' Values")
