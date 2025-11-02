import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { AttendanceLog, TodayStatus, PaginatedResponse } from '@/types';

interface AttendanceParams {
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const useAttendanceLogs = (params: AttendanceParams = {}) => {
  return useQuery<PaginatedResponse<AttendanceLog>>({
    queryKey: ['attendanceLogs', params],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/attendance', { params });
      return response.data;
    },
  });
};

export const useTodayStatus = () => {
  return useQuery<TodayStatus>({
    queryKey: ['todayStatus'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/attendance/today');
      return response.data.data;
    },
  });
};

export const useClockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { lat?: number; lng?: number; source?: string }) => {
      const idempotencyKey = crypto.randomUUID();
      const response = await apiClient.post(
        '/api/v1/attendance/clock-in',
        data,
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayStatus'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] });
    },
  });
};

export const useClockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/v1/attendance/clock-out');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayStatus'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] });
    },
  });
};

