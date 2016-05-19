inspections <- read.csv('data/Wake_County_Restaurant_Inspections.csv')
violations <- read.csv('data/Wake_County_Restaurant_Violations.csv')
restaurants <- read.csv('data/Wake_County_Restaurants.csv')

inspections <- inspections[,c('BUSINESS_ID', 'SCORE', 'DATE_', 'TYPE')]
violations <- violations[,c('BUSINESS_ID', 'CODE', 'DATE_', 'DESCRIPTION')]
restaurants <- restaurants[,c('BUSINESS_ID','NAME','ADDRESS','CITY','STATE','POSTAL_CODE','LATITUDE','LONGITUDE','PHONE_NUMBER')]

df <- merge(inspections,violations,by=c('BUSINESS_ID','DATE_'))
df <- merge(df,restaurants,by='BUSINESS_ID')
df$PHONE_NUMBER <- as.factor(df$PHONE_NUMBER)

df <- df[order(df$BUSINESS_ID, df$DATE_),]

write.csv(df,'data/wake_restaurants.csv',row.names=F,col.names=c("restaurant_id","date","score","type","code","description","name","address","city","state","zip_code","lat","lon","phone_number"))
