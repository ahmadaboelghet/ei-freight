/// @file lib/features/shipment/data/datasources/shipment_remote_datasource.dart
///
/// Remote Data Source — the ONLY place in the app that touches Firebase Functions.
///
/// Rules:
///   ✓ Calls Firebase Callable Functions via [FirebaseFunctions.httpsCallable].
///   ✓ Catches [FirebaseFunctionsException] and re-throws as [ServerException].
///   ✓ Uses the same function region as the backend ("europe-west1").
///   ✓ NEVER returns domain entities — returns raw Maps; the repository maps them.

import 'package:cloud_functions/cloud_functions.dart';
import '../../domain/entities/shipment_entities.dart';
import '../../domain/repositories/shipment_repository.dart';
import '../models/shipment_models.dart';
import '../../../../core/error/exceptions.dart';

// ─────────────────────────────────────────────────────────────
// ABSTRACT CONTRACT
// ─────────────────────────────────────────────────────────────

abstract interface class ShipmentRemoteDataSource {
  /// Calls the `createShipment` Firebase Callable Function.
  ///
  /// Returns the raw response map on success.
  /// Throws [ServerException] on any Firebase error.
  Future<Map<String, dynamic>> createShipment(CreateShipmentParams params);
}

// ─────────────────────────────────────────────────────────────
// IMPLEMENTATION
// ─────────────────────────────────────────────────────────────

final class ShipmentRemoteDataSourceImpl implements ShipmentRemoteDataSource {
  /// Firebase Functions instance scoped to the correct region.
  ///
  /// ⚠️  Region MUST match the Step 1 Cloud Function's `region` option.
  ///     If you change the region in the backend, update it here too.
  final FirebaseFunctions _functions;

  ShipmentRemoteDataSourceImpl({FirebaseFunctions? functions})
      : _functions = functions ??
            FirebaseFunctions.instanceFor(region: 'europe-west1');

  // ── Callable reference ──────────────────────────────────
  // Matches the export name in Step 1's functions/src/index.ts
  HttpsCallable get _createShipmentCallable =>
      _functions.httpsCallable('createShipment');

  @override
  Future<Map<String, dynamic>> createShipment(
    CreateShipmentParams params,
  ) async {
    try {
      // 1. Build the exact payload the Step 1 validator expects
      final payload = buildCreateShipmentPayload(
        origin: params.origin,
        destination: params.destination,
        mode: params.mode,
        cargo: params.cargo,
        seaDetails: params.seaDetails,
        roadDetails: params.roadDetails,
        clientNotes: params.clientNotes,
      );

      // 2. Call the Firebase Callable Function
      //    Firebase SDK automatically attaches the Auth ID token.
      //    No CORS headers needed — handled by the Firebase SDK.
      final HttpsCallableResult result =
          await _createShipmentCallable.call(payload);

      // 3. Cast the dynamic result data to a typed Map
      if (result.data == null) {
        throw const ServerException(
          message: 'The server returned an empty response.',
        );
      }

      return Map<String, dynamic>.from(result.data as Map);
    } on FirebaseFunctionsException catch (e) {
      // Map Firebase error code → typed ServerException so the repository
      // can further map it to a domain Failure.
      throw ServerException(
        message: e.message ?? 'A server error occurred.',
        code: e.code,
      );
    } catch (e) {
      // Catch any other unexpected error (e.g. type cast failure)
      throw ServerException(
        message: 'Unexpected error: ${e.toString()}',
      );
    }
  }
}
