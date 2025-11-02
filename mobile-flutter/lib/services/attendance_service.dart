import 'dart:convert';
import 'package:uuid/uuid.dart';
import 'api_service.dart';
import '../models/attendance_log.dart';
import '../models/today_status.dart';

class AttendanceService {
  final ApiService _api = ApiService();
  final Uuid _uuid = const Uuid();

  Future<TodayStatus> getTodayStatus() async {
    final response = await _api.get('/api/v1/attendance/today');
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return TodayStatus.fromJson(data['data']);
    }
    
    throw Exception('Failed to fetch today status');
  }

  Future<List<AttendanceLog>> getLogs({String? userId, int page = 1, int size = 20}) async {
    final params = <String, String>{
      'page': page.toString(),
      'size': size.toString(),
    };
    if (userId != null) params['user_id'] = userId;
    
    final response = await _api.get('/api/v1/attendance', params: params);
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> logsJson = data['data'];
      return logsJson.map((json) => AttendanceLog.fromJson(json)).toList();
    }
    
    throw Exception('Failed to fetch attendance logs');
  }

  Future<void> clockIn({double? lat, double? lng}) async {
    final idempotencyKey = _uuid.v4();
    final response = await _api.post(
      '/api/v1/attendance/clock-in',
      {
        'lat': lat,
        'lng': lng,
        'source': 'MOBILE',
      },
      idempotencyKey: idempotencyKey,
    );
    
    if (response.statusCode != 201) {
      throw Exception('Failed to clock in');
    }
  }

  Future<void> clockOut() async {
    final response = await _api.post('/api/v1/attendance/clock-out', {});
    
    if (response.statusCode != 200) {
      throw Exception('Failed to clock out');
    }
  }
}

