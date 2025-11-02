import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class User {
  final String userId;
  final String? email;
  final List<String> groups;
  final String? username;

  User({
    required this.userId,
    this.email,
    required this.groups,
    this.username,
  });
}

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isAuthenticated = false;

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isAdmin => _user?.groups.contains('ADMIN') ?? false;
  bool get isEmployee => _user?.groups.contains('EMPLOYEE') ?? false;

  AuthProvider() {
    _loadAuthState();
  }

  Future<void> _loadAuthState() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    if (token != null) {
      // Load user data from token/preferences
      final userId = prefs.getString('user_id');
      final email = prefs.getString('user_email');
      final groups = prefs.getStringList('user_groups') ?? [];
      
      if (userId != null) {
        _user = User(
          userId: userId,
          email: email,
          groups: groups,
          username: email?.split('@')[0],
        );
        _isAuthenticated = true;
        notifyListeners();
      }
    }
  }

  Future<void> login(String email, String password) async {
    // TODO: Replace with actual Cognito login
    // Mock login for development
    final mockUser = User(
      userId: '123',
      email: email,
      groups: ['EMPLOYEE'],
      username: email.split('@')[0],
    );

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', 'mock-jwt-token');
    await prefs.setString('user_id', mockUser.userId);
    await prefs.setString('user_email', mockUser.email ?? '');
    await prefs.setStringList('user_groups', mockUser.groups);

    _user = mockUser;
    _isAuthenticated = true;
    notifyListeners();
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_id');
    await prefs.remove('user_email');
    await prefs.remove('user_groups');

    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }
}

