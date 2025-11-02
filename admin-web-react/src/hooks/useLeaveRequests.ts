import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { LeaveRequest, PaginatedResponse } from '@/types';

interface LeaveRequestsParams {
  userId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const useLeaveRequests = (params: LeaveRequestsParams = {}) => {
  return useQuery<PaginatedResponse<LeaveRequest>>({
    queryKey: ['leaveRequests', params],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/leave/requests', { params });
      return response.data;
    },
  });
};

export const useLeaveBalances = (userId: string) => {
  return useQuery({
    queryKey: ['leaveBalances', userId],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/leave/balance', { params: { user_id: userId } });
      return response.data.data;
    },
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const idempotencyKey = crypto.randomUUID();
      const response = await apiClient.post('/api/v1/leave/requests', data, {
        headers: { 'Idempotency-Key': idempotencyKey },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
    },
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await apiClient.patch(`/api/v1/leave/requests/${id}`, { status, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
    },
  });
};

