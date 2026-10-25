/// @file lib/features/shipment/domain/repositories/shipment_repository.dart
///
/// Abstract repository contract defined in the DOMAIN layer.
///
/// Rules:
///   ✓ Pure Dart — no Firebase, no http, no Flutter imports.
///   ✓ Returns Either<Failure, Entity> — caller gets success or typed failure.
///   ✓ Implementation lives in the DATA layer (ShipmentRepositoryImpl).
///   ✓ Injected into use cases via constructor (Dependency Inversion Principle).

import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/shipment_entities.dart';

/// Parameters for creating a new shipment.
/// This is the Domain-layer contract — NOT tied to any JSON or Firebase shape.
class CreateShipmentParams {
  final ShipmentAddress origin;
  final ShipmentAddress destination;
  final ShipmentMode mode;
  final CargoDetails cargo;
  final SeaDetails? seaDetails;
  final RoadDetails? roadDetails;
  final String? clientNotes;

  const CreateShipmentParams({
    required this.origin,
    required this.destination,
    required this.mode,
    required this.cargo,
    this.seaDetails,
    this.roadDetails,
    this.clientNotes,
  });
}

/// The repository interface — Domain layer's view of what data operations exist.
abstract interface class ShipmentRepository {
  /// Creates a new shipment request and returns the created shipment summary.
  Future<Either<Failure, CreatedShipment>> createShipment(
    CreateShipmentParams params,
  );
}
