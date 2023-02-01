export type ManagementBtn = {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  text: string;
  link: string;
};

// Shape of form values
export interface DeviceFormValues {
  device_id: string;
  serial_number: string;
  imei: string;
  phone_number: string;
  batch_number: string;
  os_version: string;
  allocation_status: boolean;
  onboarding_date: Date;
  serial_number_image: string;
  manager_id: string;
  vehicle_id: string;
}
export interface DriverFormValues {
  driver_first_name: string;
  driver_last_name: string;
  phone_number: string;
  cnic: string;
  license_number: string;
  vehicle_id: string;
  address: string;
}

export interface VehicleFormValues {
  vehicleId: string;
  vehiclePlateNo: string;
  plateImg: string;
  chassisNo: string;
  color: string;
  make: string;
  weight: string;
  noOfTyres: string;
  engineNo: string;
}
