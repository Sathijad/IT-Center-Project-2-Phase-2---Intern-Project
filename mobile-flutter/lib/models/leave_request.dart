class LeaveRequest {
  final String id;
  final String userId;
  final String policyId;
  final String status;
  final String startDate;
  final String endDate;
  final String? halfDay;
  final String? reason;
  final String? approvedBy;
  final String? approvedAt;
  final String createdAt;
  final String updatedAt;

  LeaveRequest({
    required this.id,
    required this.userId,
    required this.policyId,
    required this.status,
    required this.startDate,
    required this.endDate,
    this.halfDay,
    this.reason,
    this.approvedBy,
    this.approvedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory LeaveRequest.fromJson(Map<String, dynamic> json) {
    return LeaveRequest(
      id: json['id'],
      userId: json['userId'] ?? json['user_id'],
      policyId: json['policyId'] ?? json['policy_id'],
      status: json['status'],
      startDate: json['startDate'] ?? json['start_date'],
      endDate: json['endDate'] ?? json['end_date'],
      halfDay: json['halfDay'] ?? json['half_day'],
      reason: json['reason'],
      approvedBy: json['approvedBy'] ?? json['approved_by'],
      approvedAt: json['approvedAt'] ?? json['approved_at'],
      createdAt: json['createdAt'] ?? json['created_at'],
      updatedAt: json['updatedAt'] ?? json['updated_at'],
    );
  }
}

