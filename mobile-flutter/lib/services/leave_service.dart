import 'dart:convert';
import 'api_service.dart';
import '../models/leave_balance.dart';
import '../models/leave_request.dart';
import 'package:uuid/uuid.dart';

class LeaveService {
  final ApiService _api = ApiService();
  final Uuid _uuid = const Uuid();

  Future<List<LeaveBalance>> getBalances(String userId) async {
    final response = await _api.get('/api/v1/leave/balance', params: {'user_id': userId});
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> balancesJson = data['data'];
      return balancesJson.map((json) => LeaveBalance.fromJson(json)).toList();
    }
    
    throw Exception('Failed to fetch balances');
  }

  Future<List<LeaveRequest>> getRequests({String? userId, String? status}) async {
    final params = <String, String>{};
    if (userId != null) params['user_id'] = userId;
    if (status != null) params['status'] = status;
    
    final response = await _api.get('/api/v1/leave/requests', params: params);
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> requestsJson = data['data'];
      return requestsJson.map((json) => LeaveRequest.fromJson(json)).toList();
    }
    
    throw Exception('Failed to fetch requests');
  }

  Future<LeaveRequest> createRequest(Map<String, dynamic> requestData) async {
    final idempotencyKey = _uuid.v4();
    final response = await _api.post(
      '/api/v1/leave/requests',
      requestData,
      idempotencyKey: idempotencyKey,
    );
    
    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return LeaveRequest.fromJson(data['data']);
    }
    
    throw Exception('Failed to create leave request');
  }
}

