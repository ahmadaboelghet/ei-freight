/// @file lib/features/shipment/domain/usecases/create_shipment_usecase.dart
///
/// Use Case: CreateShipment
///
/// Orchestrates the creation of a shipment request.
/// Single responsibility: validate domain rules and delegate to the repository.
///
/// The Presentation layer calls this — it never touches the repository directly.

import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/usecase/usecase.dart';
import '../entities/shipment_entities.dart';
import '../repositories/shipment_repository.dart';

/// [CreateShipmentUseCase] takes [CreateShipmentParams] and returns
/// [Either<Failure, CreatedShipment>].
///
/// Domain-level rules enforced here (before even hitting the network):
///   • Weight must be positive.
///   • Origin and destination cannot be the same country + city.
///   • Sea mode requires seaDetails. Road mode requires roadDetails.
///   • Refrigerated cargo requires both temperature bounds.
final class CreateShipmentUseCase
    implements UseCase<CreatedShipment, CreateShipmentParams> {
  final ShipmentRepository _repository;

  const CreateShipmentUseCase(this._repository);

  @override
  Future<Either<Failure, CreatedShipment>> call(
    CreateShipmentParams params,
  ) async {
    // ── Domain validation ──────────────────────────────────
    final domainError = _validate(params);
    if (domainError != null) {
      return Left(ValidationFailure(message: domainError));
    }

    // ── Delegate to Data layer ─────────────────────────────
    return _repository.createShipment(params);
  }

  String? _validate(CreateShipmentParams p) {
    if (p.cargo.weightKg <= 0) {
      return 'Weight must be a positive number.';
    }

    if (p.origin.city.trim().toLowerCase() ==
            p.destination.city.trim().toLowerCase() &&
        p.origin.country.toUpperCase() ==
            p.destination.country.toUpperCase()) {
      return 'Origin and destination cannot be the same city/country.';
    }

    if (p.mode == ShipmentMode.sea && p.seaDetails == null) {
      return 'Sea shipment details are required for sea mode.';
    }

    if (p.mode == ShipmentMode.road && p.roadDetails == null) {
      return 'Road shipment details are required for road mode.';
    }

    if (p.cargo.requiresRefrigeration) {
      if (p.cargo.temperatureMin == null || p.cargo.temperatureMax == null) {
        return 'Both min and max temperature are required for refrigerated cargo.';
      }
      if (p.cargo.temperatureMin! >= p.cargo.temperatureMax!) {
        return 'Temperature min must be strictly less than max.';
      }
    }

    return null; // All good
  }
}
