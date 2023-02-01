export const vehicleReportData = {
  last_location: {
    '@type': 'type.googleapis.com/GPSPacket',
    deviceId: '1ed3f2a9-71db-690c-b2b9-0242ac140003',
    managerId: '1ed3f288-2a1f-68be-bd32-0242ac140007',
    plateNo: 'BDS-193',
    longitude: '67.12389016666667',
    latitude: '24.918035833333334',
    speed: '0.662',
    time: '2022-10-07 17:55:22.251617',
    lastDistance: 0.0025768352,
    location: 'Gulistan e Johar Block 15',
    total_distance: 15.761325310054008,
  },
  total_distance: 15.761325310054008,
  last_online: {
    '@type': 'type.googleapis.com/OnlinePacket',
    deviceId: '1ed3f2a9-71db-690c-b2b9-0242ac140003',
    status: 'Online',
    epochtime: '1665165320',
  },
  vehicle_detail: {
    vehicle_id: '1ed3f29a-c6af-6352-8f22-0242ac140006',
    vehicle_plate_no: 'BDS-193',
    engine_no: 'PKS13027639',
    chassis_no: 'R8413PK10027632',
    color: 'Black',
    make_model: 'Suzuki Swift',
    weight: '500',
    number_of_tires: '4',
    vehicle_image: 'vehicles/1ed3f29a-656b-65dc-8f22-0242ac140006.jpeg',
    manager_id: '1ed3f288-2a1f-68be-bd32-0242ac140007',
    device_id: '1ed3f2a9-71db-690c-b2b9-0242ac140003',
  },
  current_driver: {
    driver_id: '1ed40894-ac1a-63ec-a224-0242ac140007',
    driver_first_name: 'Faran',
    driver_last_name: 'Mustafa',
    cnic: '43201-2343242-3',
    license_number: 'ASDSA023423',
    phone_number: '+92 839 4839438',
    address: 'Address 002',
    driver_media_url: 'drivers/1ed40887-bb5f-6bac-a224-0242ac140007.jpeg',
    vehicle_id: '1ed3f29a-c6af-6352-8f22-0242ac140006',
    manager_id: '1ed3f288-2a1f-68be-bd32-0242ac140007',
    created_at: '2022-09-30T06:23:23.051737+00:00',
    updated_at: '2022-10-05T14:01:18.121898+00:00',
  },
  auth_status: false,
};

export const tripsData = [
  {
    tripNo: '1',
    startLocation: 'Lahore',
    endLocation: 'Karachi',
    startedAt: '2018-10-19',
    endedAt: '2018-10-21',
    sessions: [
      {
        session_id: '1ed6ad23-6c76-6a8e-9e85-024275fbab63',
        vehicle_detail: {
          vehicle_id: '1ed5b58e-531f-64e2-a6ec-0242c0a80004',
          vehicle_plate_no: 'JW-0389',
          engine_no: 'ENG-12345',
          chassis_no: '123123123123123',
          color: 'White',
          make_model: 'DONG FENG 2022 Truck',
          weight: '2000',
          number_of_tires: '4',
          vehicle_image: 'vehicles/1ed5b58d-fa34-62ce-a6ec-0242c0a80004.jpeg',
          manager_id: '1ed5a929-af94-63e2-893b-0242c0a80002',
          device_id: '1ed5b5be-7a1d-63b6-9cc3-0242c0a80003',
        },
        driver_details: [
          null,
          {
            driver_id: '1ed5b5e5-037e-68d2-80cc-0242c0a80009',
            driver_first_name: 'abdul',
            driver_last_name: 'sattar',
            cnic: '28526-4756843-9',
            license_number: '23594-8545475-4#23',
            phone_number: '+923065374950',
            address: 'House#3',
            driver_media_url: 'drivers/1ed5b5e5-037e-6558-80cc-0242c0a80009.jpeg',
            vehicle_id: '1ed5b58e-531f-64e2-a6ec-0242c0a80004',
            manager_id: '1ed5a929-af94-63e2-893b-0242c0a80002',
            created_at: '2022-11-03T09:52:00.843074+00:00',
            updated_at: '2022-11-03T09:52:00.843074+00:00',
          },
        ],
        start_location: {
          '@type': 'type.googleapis.com/GPSPacket',
          deviceId: '1ed5b5be-7a1d-63b6-9cc3-0242c0a80003',
          managerId: '1ed5a929-af94-63e2-893b-0242c0a80002',
          plateNo: 'JW-0389',
          longitude: '73.91326916666667',
          latitude: '31.123246166666668',
          speed: '0.193',
          time: '2022-11-23 01:57:32.841854',
          lastDistance: 1e-13,
          location: 'قومی شاہراہ',
        },
        end_location: {
          '@type': 'type.googleapis.com/GPSPacket',
          deviceId: '1ed5b5be-7a1d-63b6-9cc3-0242c0a80003',
          managerId: '1ed5a929-af94-63e2-893b-0242c0a80002',
          plateNo: 'JW-0389',
          longitude: '73.92081783333333',
          latitude: '31.155735666666665',
          speed: '0.609',
          time: '2022-11-23 02:31:32.085718',
          lastDistance: 0.0035516764,
          location: 'قومی شاہراہ',
        },
        route_location_data: [
          {
            longitude: '73.92081783333333',
            latitude: '31.155735666666665',
            speed: '0.609',
            time_stamp: '2022-11-23 02:31:32.244221',
          },
          {
            longitude: '73.920787',
            latitude: '31.155753666666666',
            speed: '3.963',
            time_stamp: '2022-11-23 02:31:22.218463',
          },
        ],
        start_time: '2022-11-23 01:59:33.274878',
        end_time: '2022-11-23 02:31:32.831112',
        total_time: 1919.556234,
        total_distance: 6.4712990259359024,
        total_idle_time: 977.487222,
        total_events: 10,
        drowsy_count: 1,
        distracted_count: 9,
        travel_time: 942.0690119999999,
        max_speed: 35.179,
        avg_speed: 8.654063745019926,
        current_driver: {
          driver_id: '1ed5b5e5-037e-68d2-80cc-0242c0a80009',
          driver_first_name: 'abdul',
          driver_last_name: 'sattar',
          cnic: '28526-4756843-9',
          license_number: '23594-8545475-4#23',
          phone_number: '+923065374950',
          address: 'House#3',
          driver_media_url: 'drivers/1ed5b5e5-037e-6558-80cc-0242c0a80009.jpeg',
          vehicle_id: '1ed5b58e-531f-64e2-a6ec-0242c0a80004',
          manager_id: '1ed5a929-af94-63e2-893b-0242c0a80002',
          created_at: '2022-11-03T09:52:00.843074+00:00',
          updated_at: '2022-11-03T09:52:00.843074+00:00',
        },
        auth_status: true,
      },
      {
        session_id: '1ed6ad23-6c76-6a8e-9e85-024275fbab63',
        vehicle_detail: {
          vehicle_id: '1ed5b58e-531f-64e2-a6ec-0242c0a80004',
          vehicle_plate_no: 'JW-0389',
          engine_no: 'ENG-12345',
          chassis_no: '123123123123123',
          color: 'White',
          make_model: 'DONG FENG 2022 Truck',
          weight: '2000',
          number_of_tires: '4',
          vehicle_image: 'vehicles/1ed5b58d-fa34-62ce-a6ec-0242c0a80004.jpeg',
          manager_id: '1ed5a929-af94-63e2-893b-0242c0a80002',
          device_id: '1ed5b5be-7a1d-63b6-9cc3-0242c0a80003',
        },
        driver_details: [
          null,
          {
            driver_id: '1ed5b5e5-037e-68d2-80cc-0242c0a80009',
            driver_first_name: 'abdul',
            driver_last_name: 'sattar',
            cnic: '28526-4756843-9',
            license_number: '23594-8545475-4#23',
            phone_number: '+923065374950',
            address: 'House#3',
            driver_media_url: 'drivers/1ed5b5e5-037e-6558-80cc-0242c0a80009.jpeg',
            vehicle_id: '1ed5b58e-531f-64e2-a6ec-0242c0a80004',
            manager_id: '1ed5a929-af94-63e2-893b-0242c0a80002',
            created_at: '2022-11-03T09:52:00.843074+00:00',
            updated_at: '2022-11-03T09:52:00.843074+00:00',
          },
        ],
        start_location: {
          '@type': 'type.googleapis.com/GPSPacket',
          deviceId: '1ed5b5be-7a1d-63b6-9cc3-0242c0a80003',
          managerId: '1ed5a929-af94-63e2-893b-0242c0a80002',
          plateNo: 'JW-0389',
          longitude: '73.91326916666667',
          latitude: '31.123246166666668',
          speed: '0.193',
          time: '2022-11-23 01:57:32.841854',
          lastDistance: 1e-13,
          location: 'قومی شاہراہ',
        },
        end_location: {
          '@type': 'type.googleapis.com/GPSPacket',
          deviceId: '1ed5b5be-7a1d-63b6-9cc3-0242c0a80003',
          managerId: '1ed5a929-af94-63e2-893b-0242c0a80002',
          plateNo: 'JW-0389',
          longitude: '73.92081783333333',
          latitude: '31.155735666666665',
          speed: '0.609',
          time: '2022-11-23 02:31:32.085718',
          lastDistance: 0.0035516764,
          location: 'قومی شاہراہ',
        },
        route_location_data: [
          {
            longitude: '73.92081783333333',
            latitude: '31.155735666666665',
            speed: '0.609',
            time_stamp: '2022-11-23 02:31:32.244221',
          },
          {
            longitude: '73.920787',
            latitude: '31.155753666666666',
            speed: '3.963',
            time_stamp: '2022-11-23 02:31:22.218463',
          },
        ],
        start_time: '2022-11-23 01:59:33.274878',
        end_time: '2022-11-23 02:31:32.831112',
        total_time: 1919.556234,
        total_distance: 6.4712990259359024,
        total_idle_time: 977.487222,
        total_events: 10,
        drowsy_count: 1,
        distracted_count: 9,
        travel_time: 942.0690119999999,
        max_speed: 35.179,
        avg_speed: 8.654063745019926,
        current_driver: {
          driver_id: '1ed5b5e5-037e-68d2-80cc-0242c0a80009',
          driver_first_name: 'abdul',
          driver_last_name: 'sattar',
          cnic: '28526-4756843-9',
          license_number: '23594-8545475-4#23',
          phone_number: '+923065374950',
          address: 'House#3',
          driver_media_url: 'drivers/1ed5b5e5-037e-6558-80cc-0242c0a80009.jpeg',
          vehicle_id: '1ed5b58e-531f-64e2-a6ec-0242c0a80004',
          manager_id: '1ed5a929-af94-63e2-893b-0242c0a80002',
          created_at: '2022-11-03T09:52:00.843074+00:00',
          updated_at: '2022-11-03T09:52:00.843074+00:00',
        },
        auth_status: true,
      },
    ],
  },
  {
    tripNo: '2',
    startLocation: 'Karachi',
    endLocation: 'Lahore',
    startedAt: '2018-10-22',
    endedAt: '2018-10-24',
    sessions: [
      {
        session_id: '1ed6ad23-6c76-6a8e-9e85-024275fbab63',
        vehicle_detail: {
          vehicle_id: '1ed5b58e-531f-64e2-a6ec-0242c0a80004',
          vehicle_plate_no: 'JW-0389',
          engine_no: 'ENG-12345',
          chassis_no: '123123123123123',
          color: 'White',
          make_model: 'DONG FENG 2022 Truck',
          weight: '2000',
          number_of_tires: '4',
          vehicle_image: 'vehicles/1ed5b58d-fa34-62ce-a6ec-0242c0a80004.jpeg',
          manager_id: '1ed5a929-af94-63e2-893b-0242c0a80002',
          device_id: '1ed5b5be-7a1d-63b6-9cc3-0242c0a80003',
        },
        driver_details: [
          null,
          {
            driver_id: '1ed5b5e5-037e-68d2-80cc-0242c0a80009',
            driver_first_name: 'abdul',
            driver_last_name: 'sattar',
            cnic: '28526-4756843-9',
            license_number: '23594-8545475-4#23',
            phone_number: '+923065374950',
            address: 'House#3',
            driver_media_url: 'drivers/1ed5b5e5-037e-6558-80cc-0242c0a80009.jpeg',
            vehicle_id: '1ed5b58e-531f-64e2-a6ec-0242c0a80004',
            manager_id: '1ed5a929-af94-63e2-893b-0242c0a80002',
            created_at: '2022-11-03T09:52:00.843074+00:00',
            updated_at: '2022-11-03T09:52:00.843074+00:00',
          },
        ],
        start_location: {
          '@type': 'type.googleapis.com/GPSPacket',
          deviceId: '1ed5b5be-7a1d-63b6-9cc3-0242c0a80003',
          managerId: '1ed5a929-af94-63e2-893b-0242c0a80002',
          plateNo: 'JW-0389',
          longitude: '73.91326916666667',
          latitude: '31.123246166666668',
          speed: '0.193',
          time: '2022-11-23 01:57:32.841854',
          lastDistance: 1e-13,
          location: 'قومی شاہراہ',
        },
        end_location: {
          '@type': 'type.googleapis.com/GPSPacket',
          deviceId: '1ed5b5be-7a1d-63b6-9cc3-0242c0a80003',
          managerId: '1ed5a929-af94-63e2-893b-0242c0a80002',
          plateNo: 'JW-0389',
          longitude: '73.92081783333333',
          latitude: '31.155735666666665',
          speed: '0.609',
          time: '2022-11-23 02:31:32.085718',
          lastDistance: 0.0035516764,
          location: 'قومی شاہراہ',
        },
        route_location_data: [
          {
            longitude: '73.92081783333333',
            latitude: '31.155735666666665',
            speed: '0.609',
            time_stamp: '2022-11-23 02:31:32.244221',
          },
          {
            longitude: '73.920787',
            latitude: '31.155753666666666',
            speed: '3.963',
            time_stamp: '2022-11-23 02:31:22.218463',
          },
        ],
        start_time: '2022-11-23 01:59:33.274878',
        end_time: '2022-11-23 02:31:32.831112',
        total_time: 1919.556234,
        total_distance: 6.4712990259359024,
        total_idle_time: 977.487222,
        total_events: 10,
        drowsy_count: 1,
        distracted_count: 9,
        travel_time: 942.0690119999999,
        max_speed: 35.179,
        avg_speed: 8.654063745019926,
        current_driver: {
          driver_id: '1ed5b5e5-037e-68d2-80cc-0242c0a80009',
          driver_first_name: 'abdul',
          driver_last_name: 'sattar',
          cnic: '28526-4756843-9',
          license_number: '23594-8545475-4#23',
          phone_number: '+923065374950',
          address: 'House#3',
          driver_media_url: 'drivers/1ed5b5e5-037e-6558-80cc-0242c0a80009.jpeg',
          vehicle_id: '1ed5b58e-531f-64e2-a6ec-0242c0a80004',
          manager_id: '1ed5a929-af94-63e2-893b-0242c0a80002',
          created_at: '2022-11-03T09:52:00.843074+00:00',
          updated_at: '2022-11-03T09:52:00.843074+00:00',
        },
        auth_status: true,
      },
    ],
  },
];
