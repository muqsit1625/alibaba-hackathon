#!/bin/bash

# Declare an array of string with type
declare -a service_dirs=("anomalies-service" "auth-service" "cloudamqp-service" "devices-service" "drivers-service" "liveview-service" "managers-service" "reporting-service" "vehicles-service")

# Iterate the string array using for loop
for val in ${service_dirs[@]}; do
    cd ./$val/
    docker build --platform linux/amd64 -t autilent/$val .
    docker tag autilent/$val:latest public.ecr.aws/y6h8v2m5/autilent/$val:latest
    docker push public.ecr.aws/y6h8v2m5/autilent/$val:latest
    cd ../
done