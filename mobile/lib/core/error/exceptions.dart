/// @file lib/core/error/exceptions.dart
///
/// Raw exception types thrown by the Data layer.
/// These are always caught INSIDE the data layer and mapped to [Failure] types.
/// They must NEVER leak into the Domain or Presentation layers.

class ServerException implements Exception {
  final String message;
  final String? code;
  const ServerException({required this.message, this.code});
}

class AuthException implements Exception {
  final String message;
  final String? code;
  const AuthException({required this.message, this.code});
}

class NetworkException implements Exception {
  final String message;
  const NetworkException({this.message = 'No internet connection.'});
}
