/// @file lib/core/utils/firebase_function_error_mapper.dart
///
/// Maps [FirebaseFunctionsException] codes → typed [Failure] objects.
/// Centralised here so every remote data source uses identical error mapping.

import 'package:cloud_functions/cloud_functions.dart';
import '../error/failures.dart';

/// Maps a [FirebaseFunctionsException] to the appropriate [Failure] subtype.
///
/// Firebase Functions error codes are documented at:
/// https://firebase.google.com/docs/functions/callable#handle_errors_on_the_client
Failure mapFunctionException(FirebaseFunctionsException e) {
  final code = e.code;
  final msg = e.message ?? 'An unexpected error occurred.';

  switch (code) {
    case 'unauthenticated':
      return AuthFailure(message: msg, code: code);

    case 'permission-denied':
      return PermissionFailure(message: msg, code: code);

    case 'invalid-argument':
      return ValidationFailure(message: msg, code: code);

    case 'resource-exhausted':
      return QuotaExceededFailure(message: msg, code: code);

    case 'not-found':
      return NotFoundFailure(message: msg, code: code);

    case 'unavailable':
    case 'deadline-exceeded':
      return NetworkFailure(message: msg, code: code);

    case 'internal':
    default:
      return ServerFailure(message: msg, code: code);
  }
}
