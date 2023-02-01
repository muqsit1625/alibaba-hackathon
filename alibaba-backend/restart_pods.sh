#!/bin/bash

# Declare an array of string with type
declare -a service_dirs=("anomalies-service" "auth-service" "cloudamqp-service" "devices-service" "drivers-service" "liveview-service" "managers-service" "reporting-service" "vehicles-service")

# Iterate the string array using for loop
for val in ${service_dirs[@]}; do
    pat="/^${val}/"
    echo $pat
    kubectl get pods --no-headers=true | awk pat="$pat {print \$1}" | xargs kubectl delete pod --grace-period=0 --force
done