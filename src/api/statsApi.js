import API from './axios';
import { BaseURL } from '../BaseURL/Baseurl';

export const fetchAdalatLogs = async ({
  startDate = '',
  endDate = '',
  warrantType = '',
  appearanceMode = '',
  custodyStatus = '',
  attended = '',
  search = '',
  page = 1,
  limit = 50,
} = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(warrantType && { warrantType }),
    ...(appearanceMode && { appearanceMode }),
    ...(custodyStatus && { custodyStatus }),
    ...(attended !== '' && { attended }),
    ...(search.trim() && { search: search.trim() }),
  });

  const response = await API.get(`${BaseURL}/api/statsLog/logs?${params.toString()}`);
  return response.data;
};