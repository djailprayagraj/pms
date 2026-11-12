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










// statsApi.js
export const fetchIndividualPrisonerStats = async ({
  utNumber = '',
  firNumber = '',
  prisonerName = '',
  startDate = '',
  endDate = '',
} = {}) => {
  const params = new URLSearchParams({
    ...(utNumber.trim() && { utNumber: utNumber.trim() }),
    ...(firNumber.trim() && { firNumber: firNumber.trim() }),
    ...(prisonerName.trim() && { prisonerName: prisonerName.trim() }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  const response = await API.get(`/api/statsLog/individual?${params.toString()}`);
  return response.data;
};