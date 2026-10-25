/// @file lib/core/error/failures.dart
///
/// Canonical failure types for the Domain and Presentation layers.
/// The Data layer catches raw exceptions and maps them into these types.
/// Presentation layer NEVER sees FirebaseFunctionsException directly.
///
/// Pattern: Sealed class hierarchy — one branch per failure category.

import 'package:equatable/equatable.dart';

/// Base class for all application failures.
abstract class Failure extends Equatable {
  final String message;
  final String? code;

  const Failure({required this.message, this.code});

  @override
  List<Object?> get props => [message, code];
}

// ─────────────────────────────────────────────────────────────
// CONCRETE FAILURE TYPES
// ─────────────────────────────────────────────────────────────

/// The user is not signed in or their token is invalid.
class AuthFailure extends Failure {
  const AuthFailure({required super.message, super.code});
}

/// The user's account lacks permission for this action.
class PermissionFailure extends Failure {
  const PermissionFailure({required super.message, super.code});
}

/// One or more input fields did not pass server-side validation.
class ValidationFailure extends Failure {
  const ValidationFailure({required super.message, super.code});
}

/// The monthly shipment quota has been exceeded.
class QuotaExceededFailure extends Failure {
  const QuotaExceededFailure({required super.message, super.code});
}

/// The requested resource was not found.
class NotFoundFailure extends Failure {
  const NotFoundFailure({required super.message, super.code});
}

/// A network connectivity issue occurred.
class NetworkFailure extends Failure {
  const NetworkFailure({required super.message, super.code});
}

/// An unexpected server-side error occurred.
class ServerFailure extends Failure {
  const ServerFailure({required super.message, super.code});
}

/// An unexpected client-side error occurred.
class UnknownFailure extends Failure {
  const UnknownFailure({required super.message, super.code});
}
