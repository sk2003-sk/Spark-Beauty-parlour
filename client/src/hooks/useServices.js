import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';

// Cached for 5 minutes so moving between pages feels instant
export const useServices = () =>
  useQuery({ queryKey: ['services'], queryFn: () => api.get('/services').then((r) => r.data), staleTime: 5 * 60 * 1000 });
