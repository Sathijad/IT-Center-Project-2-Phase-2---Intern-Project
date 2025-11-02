import 'attendance_log.dart';

class TodayStatus {
  final String status;
  final AttendanceLog? log;

  TodayStatus({
    required this.status,
    this.log,
  });

  factory TodayStatus.fromJson(Map<String, dynamic> json) {
    return TodayStatus(
      status: json['status'],
      log: json['log'] != null ? AttendanceLog.fromJson(json['log']) : null,
    );
  }
}

