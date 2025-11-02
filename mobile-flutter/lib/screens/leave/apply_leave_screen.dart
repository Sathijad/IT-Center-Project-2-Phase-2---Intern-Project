import 'package:flutter/material.dart';
import '../../services/leave_service.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';

class ApplyLeaveScreen extends StatefulWidget {
  const ApplyLeaveScreen({super.key});

  @override
  State<ApplyLeaveScreen> createState() => _ApplyLeaveScreenState();
}

class _ApplyLeaveScreenState extends State<ApplyLeaveScreen> {
  final _formKey = GlobalKey<FormState>();
  final LeaveService _leaveService = LeaveService();
  
  String? _policyId;
  DateTime? _startDate;
  DateTime? _endDate;
  String? _reason;
  bool _isLoading = false;

  Future<void> _selectDate(BuildContext context, bool isStartDate) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        if (isStartDate) {
          _startDate = picked;
        } else {
          _endDate = picked;
        }
      });
    }
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;
    if (_policyId == null || _startDate == null || _endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await _leaveService.createRequest({
        'policy_id': _policyId,
        'start_date': _startDate!.toIso8601String().split('T')[0],
        'end_date': _endDate!.toIso8601String().split('T')[0],
        'reason': _reason,
      });

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Leave request submitted successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Apply for Leave')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Leave Type',
                  border: OutlineInputBorder(),
                ),
                value: _policyId,
                items: const [
                  DropdownMenuItem(value: '1', child: Text('Annual Leave')),
                  DropdownMenuItem(value: '2', child: Text('Casual Leave')),
                  DropdownMenuItem(value: '3', child: Text('Sick Leave')),
                ],
                onChanged: (value) => setState(() => _policyId = value),
              ),
              const SizedBox(height: 16),
              InkWell(
                onTap: () => _selectDate(context, true),
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Start Date',
                    border: OutlineInputBorder(),
                  ),
                  child: Text(
                    _startDate?.toIso8601String().split('T')[0] ?? 'Select start date',
                  ),
                ),
              ),
              const SizedBox(height: 16),
              InkWell(
                onTap: () => _selectDate(context, false),
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'End Date',
                    border: OutlineInputBorder(),
                  ),
                  child: Text(
                    _endDate?.toIso8601String().split('T')[0] ?? 'Select end date',
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Reason',
                  border: OutlineInputBorder(),
                ),
                onSaved: (value) => _reason = value,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _submitRequest,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Submit Request'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

