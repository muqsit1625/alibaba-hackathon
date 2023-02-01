export interface VehicleReportInputProps {
  setData: React.Dispatch<
    React.SetStateAction<{
      vehicle: any;
      dates: Date | Date[] | undefined;
    }>
  >;
  loading?: boolean;
}
