import 'package:flutter/material.dart';
import '../../models/attendance_log.dart';
import '../../models/today_status.dart';
import '../../services/attendance_service.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final AttendanceService _attendanceService = AttendanceService();
  TodayStatus? _status;
  List<AttendanceLog>? _logs;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      _status = await _attendanceService.getTodayStatus();
      _logs = await _attendanceService.getLogs();
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

  Future<void> _clockIn() async {
    setState(() => _isLoading = true);
    try {
      // Request location permission
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Location services are disabled');
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }

      // Get current location
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Clock in with location
      await _attendanceService.clockIn(
        lat: position.latitude,
        lng: position.longitude,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Clocked in successfully')),
        );
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to clock in: $e')),
        );
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _clockOut() async {
    setState(() => _isLoading = true);
    try {
      await _attendanceService.clockOut();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Clocked out successfully')),
        );
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to clock out: $e')),
        );
        setState(() => _isLoading = false);
      }
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
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Text(
                    "Today's Status",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _status?.status ?? 'Unknown',
                    style: const TextStyle(fontSize: 18),
                  ),
                  if (_status?.log != null) ...[
                    const SizedBox(height: 8),
                    Text('Clock In: ${_status!.log!.clockIn}'),
                    if (_status!.log!.clockOut != null)
                      Text('Clock Out: ${_status!.log!.clockOut}'),
                    if (_status!.log!.durationMinutes != null)
                      Text('Duration: ${_status!.log!.durationMinutes} minutes'),
                  ],
                  const SizedBox(height: 16),
                  if (_status?.status == 'NOT_STARTED')
                    ElevatedButton.icon(
                      onPressed: _clockIn,
                      icon: const Icon(Icons.access_time),
                      label: const Text('Clock In'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 48),
                      ),
                    )
                  else if (_status?.status == 'CLOCKED_IN')
                    ElevatedButton.icon(
                      onPressed: _clockOut,
                      icon: const Icon(Icons.access_time_filled),
                      label: const Text('Clock Out'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 48),
                        backgroundColor: Colors.red,
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Recent Logs',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          if (_logs != null && _logs!.isNotEmpty)
            ..._logs!.map((log) => Card(
                  child: ListTile(
                    title: Text('Date: ${log.clockIn}'),
                    subtitle: log.clockOut != null
                        ? Text('Clock Out: ${log.clockOut}')
                        : null,
                    trailing: log.durationMinutes != null
                        ? Text('${log.durationMinutes}m')
                        : null,
                  ),
                ))
          else
            const Card(child: ListTile(title: Text('No attendance logs yet'))),
        ],
      ),
    );
  }
}

