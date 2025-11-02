class AttendanceLog {
  final String id;
  final String userId;
  final String clockIn;
  final String? clockOut;
  final int? durationMinutes;
  final double? lat;
  final double? lng;
  final String source;
  final String createdAt;

  AttendanceLog({
    required this.id,
    required this.userId,
    required this.clockIn,
    this.clockOut,
    this.durationMinutes,
    this.lat,
    this.lng,
    required this.source,
    required this.createdAt,
  });

  factory AttendanceLog.fromJson(Map<String, dynamic> json) {
    return AttendanceLog(
      id: json['id'],
      userId: json['userId'] ?? json['user_id'],
      clockIn: json['clockIn'] ?? json['clock_in'],
      clockOut: json['clockOut'] ?? json['clock_out'],
      durationMinutes: json['durationMinutes'] ?? json['duration_minutes'],
      lat: json['lat']?.toDouble(),
      lng: json['lng']?.toDouble(),
      source: json['source'],
      createdAt: json['createdAt'] ?? json['created_at'],
    );
  }
}

