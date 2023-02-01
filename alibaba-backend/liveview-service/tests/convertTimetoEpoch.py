import time


# need to get the exact pattern to match date string comming from mongo


# bugs resolve was having seconds in float so finding pattern that accepts that

date_time = '2022-10-03 09:25:27.335975'
pattern = '%Y-%m-%d %H:%M:%S.%f'
epoch = int(time.mktime(time.strptime(date_time, pattern)))
print(f"epoch: {epoch}")
