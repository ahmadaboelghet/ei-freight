/// @file lib/features/shipment/data/repositories_impl/shipment_repository_impl.dart
///
/// Concrete implementation of [ShipmentRepository] (Data layer).
///
/// Responsibilities:
///   ✓ Calls the [ShipmentRemoteDataSource].
///   ✓ Catches [ServerException] and maps it to a typed [Failure].
///   ✓ Maps raw Map responses to domain entities using model helpers.
///   ✓ Returns [Either<Failure, Entity>] — the Domain layer's language.

import 'package:dartz/dartz.dart';
import 'package:cloud_functions/cloud_functions.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/utils/firebase_function_error_mapper.dart';
import '../../domain/entities/shipment_entities.dart';
import '../../domain/repositories/shipment_repository.dart';
import '../datasources/shipment_remote_datasource.dart';
import '../models/shipment_models.dart';

final class ShipmentRepositoryImpl implements ShipmentRepository {
  final ShipmentRemoteDataSource _remoteDataSource;

  const ShipmentRepositoryImpl(this._remoteDataSource);

  @override
  Future<Either<Failure, CreatedShipment>> createShipment(
    CreateShipmentParams params,
  ) async {
    try {
      final responseMap = await _remoteDataSource.createShipment(params);
      final entity = parseCreateShipmentResponse(responseMap);
      return Right(entity);
    } on FirebaseFunctionsException catch (e) {
      // If the exception somehow bubbles past the data source, catch it here
      return Left(mapFunctionException(e));
    } on ServerException catch (e) {
      // Map the ServerException code → correct Failure subtype
      return Left(_mapServerException(e));
    } catch (e) {
      return Left(UnknownFailure(message: e.toString()));
    }
  }

  /// Maps [ServerException] codes (from Firebase) to typed [Failure] objects.
  Failure _mapServerException(ServerException e) {
    switch (e.code) {
      case 'unauthenticated':
        return AuthFailure(message: e.message, code: e.code);
      case 'permission-denied':
        return PermissionFailure(message: e.message, code: e.code);
      case 'invalid-argument':
        return ValidationFailure(message: e.message, code: e.code);
      case 'resource-exhausted':
        return QuotaExceededFailure(message: e.message, code: e.code);
      case 'not-found':
        return NotFoundFailure(message: e.message, code: e.code);
      case 'unavailable':
      case 'deadline-exceeded':
        return NetworkFailure(message: e.message, code: e.code);
      case 'internal':
      default:
        return ServerFailure(message: e.message, code: e.code);
    }
  }
}
