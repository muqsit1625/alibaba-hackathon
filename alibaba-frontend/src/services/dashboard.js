import axios from 'axios';

import { apiRoute, fetchToken } from '../global/apiRoute';

const axiosClient = axios.create({
  baseURL: `${apiRoute}`,
});

const config = fetchToken();

class DashboardService {
  getAllVehicles() {
    return axiosClient.get('/vehicles/api/v1/all', config);
  }

  getAllVehiclesLocation() {
    return axiosClient.get('/vehicles/api/v1/all/locations', config);
  }

  getAllDrivers() {
    return axiosClient.get('/drivers/api/v1/all', config);
  }
}

export default new DashboardService();
