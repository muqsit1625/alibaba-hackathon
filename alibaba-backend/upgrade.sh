#!/bin/bash

# Declare an array of string with type
declare -a service_dirs=("anomalies-service" "auth-service" "cloudamqp-service" "devices-service" "drivers-service" "liveview-service" "managers-service" "reporting-service" "vehicles-service" "fleet-manager-frontend")

# Iterate the string array using for loop
for val in ${service_dirs[@]}; do
    helm upgrade $val ./helm/$val
done