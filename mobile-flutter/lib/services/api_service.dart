import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8082';
  
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    return headers;
  }

  Future<http.Response> get(String endpoint, {Map<String, String>? params}) async {
    final headers = await _getHeaders();
    final uri = Uri.parse('$baseUrl$endpoint').replace(queryParameters: params);
    
    final response = await http.get(uri, headers: headers);
    _handleResponse(response);
    return response;
  }

  Future<http.Response> post(String endpoint, Map<String, dynamic> body, {String? idempotencyKey}) async {
    final headers = await _getHeaders();
    if (idempotencyKey != null) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
    
    _handleResponse(response);
    return response;
  }

  Future<http.Response> patch(String endpoint, Map<String, dynamic> body) async {
    final headers = await _getHeaders();
    
    final response = await http.patch(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
    
    _handleResponse(response);
    return response;
  }

  void _handleResponse(http.Response response) {
    if (response.statusCode == 401) {
      throw Exception('Unauthorized - Please login');
    }
    if (response.statusCode == 403) {
      throw Exception('Forbidden - Insufficient permissions');
    }
    if (response.statusCode >= 400) {
      throw Exception('Request failed: ${response.statusCode}');
    }
  }
}

