import 'package:flutter/material.dart';
import '../../models/leave_balance.dart';
import '../../models/leave_request.dart';
import '../../services/leave_service.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'apply_leave_screen.dart';

class LeaveHomeScreen extends StatefulWidget {
  const LeaveHomeScreen({super.key});

  @override
  State<LeaveHomeScreen> createState() => _LeaveHomeScreenState();
}

class _LeaveHomeScreenState extends State<LeaveHomeScreen> {
  final LeaveService _leaveService = LeaveService();
  List<LeaveBalance>? _balances;
  List<LeaveRequest>? _requests;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = context.read<AuthProvider>().user;
      if (user != null) {
        _balances = await _leaveService.getBalances(user.userId);
        _requests = await _leaveService.getRequests(userId: user.userId);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load data: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'My Leave Balances',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          if (_balances != null && _balances!.isNotEmpty)
            ..._balances!.map((balance) => Card(
                  child: ListTile(
                    title: Text('Balance: ${balance.balanceDays} days'),
                    subtitle: Text('Policy: ${balance.policyId}'),
                  ),
                ))
          else
            const Card(child: ListTile(title: Text('No balances found'))),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ApplyLeaveScreen()),
              );
              _loadData();
            },
            icon: const Icon(Icons.add),
            label: const Text('Apply for Leave'),
          ),
          const SizedBox(height: 24),
          const Text(
            'Recent Requests',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          if (_requests != null && _requests!.isNotEmpty)
            ..._requests!.map((request) => Card(
                  child: ListTile(
                    title: Text('${request.startDate} - ${request.endDate}'),
                    subtitle: Text(request.status),
                    trailing: _getStatusIcon(request.status),
                  ),
                ))
          else
            const Card(child: ListTile(title: Text('No requests yet'))),
        ],
      ),
    );
  }

  Widget _getStatusIcon(String status) {
    Icon icon;
    Color color;
    switch (status) {
      case 'APPROVED':
        icon = const Icon(Icons.check_circle);
        color = Colors.green;
        break;
      case 'REJECTED':
        icon = const Icon(Icons.cancel);
        color = Colors.red;
        break;
      case 'PENDING':
        icon = const Icon(Icons.pending);
        color = Colors.orange;
        break;
      default:
        icon = const Icon(Icons.help);
        color = Colors.grey;
    }
    return Icon(icon.icon, color: color);
  }
}

