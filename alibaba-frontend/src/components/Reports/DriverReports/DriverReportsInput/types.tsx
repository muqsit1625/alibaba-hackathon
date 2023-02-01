export interface DriverReportInputProps {
  setData: React.Dispatch<
    React.SetStateAction<{
      driver: any;
      dates: Date | Date[] | undefined;
    }>
  >;
  loading?: boolean;
}
