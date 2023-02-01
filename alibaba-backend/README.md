# Autilent-MSBackend-v1

python-microservice-fastapi

# Things to follow

- We follow snake case
- See the dummy service pattern to take inspiration for the new service being created

## How to run??

- Make sure you have installed `docker` and `docker-compose`
- Run `docker-compose up -d`
- Head over to http://localhost:8080/api/v1/vehicles/docs for vehicles service docs
  and http://localhost:8080/api/v1/devices/docs for devices service docs

## URLs to access

- http://localhost:8080/api/v1/vehicles/docs 
- http://localhost:8080/api/v1/devices/docs 
- http://localhost:8080/api/v1/auth/docs 
- http://localhost:8080/api/v1/managers/docs 
- http://localhost:8080/api/v1/reporting/docs 



#### Point to Remember : replace all user-id's hard-coded with the super admin id

#### Roles :
```
1. super_admin
2. fleet_manager
```


### Manager Images field:
```
face_sides : [left_side_url, right_side_url]
cnic_images : [front_url, back_url]
```