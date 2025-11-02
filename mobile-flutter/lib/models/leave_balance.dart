class LeaveBalance {
  final String id;
  final String userId;
  final String policyId;
  final double balanceDays;
  final String updatedAt;

  LeaveBalance({
    required this.id,
    required this.userId,
    required this.policyId,
    required this.balanceDays,
    required this.updatedAt,
  });

  factory LeaveBalance.fromJson(Map<String, dynamic> json) {
    return LeaveBalance(
      id: json['id'],
      userId: json['userId'] ?? json['user_id'],
      policyId: json['policyId'] ?? json['policy_id'],
      balanceDays: (json['balanceDays'] ?? json['balance_days'] ?? 0).toDouble(),
      updatedAt: json['updatedAt'] ?? json['updated_at'],
    );
  }
}

