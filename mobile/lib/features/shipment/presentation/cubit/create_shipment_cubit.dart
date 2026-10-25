/// @file lib/features/shipment/presentation/cubit/create_shipment_cubit.dart
///
/// [CreateShipmentCubit] — Presentation layer orchestrator.
///
/// Responsibilities:
///   ✓ Receives a submit signal from the UI (with raw form values).
///   ✓ Builds domain objects (entities/params) from form data.
///   ✓ Calls [CreateShipmentUseCase].
///   ✓ Emits the appropriate [CreateShipmentState].
///   ✗ Does NOT know anything about Firebase, HTTP, or JSON.

import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/shipment_entities.dart';
import '../../domain/usecases/create_shipment_usecase.dart';
import '../../domain/repositories/shipment_repository.dart';
import 'create_shipment_state.dart';

final class CreateShipmentCubit extends Cubit<CreateShipmentState> {
  final CreateShipmentUseCase _createShipmentUseCase;

  CreateShipmentCubit(this._createShipmentUseCase)
      : super(const CreateShipmentInitial());

  /// Called by the UI when the user taps "Submit Request".
  ///
  /// All parameters are raw strings/values from the form —
  /// the Cubit converts them to typed domain objects.
  Future<void> submitShipment({
    // ── Origin ────────────────────────────────────────────
    required String originLabel,
    required String originCity,
    required String originGov,
    required String originCountry,
    String? originStreet,

    // ── Destination ───────────────────────────────────────
    required String destLabel,
    required String destCity,
    required String destGov,
    required String destCountry,
    String? destStreet,

    // ── Mode ──────────────────────────────────────────────
    required ShipmentMode mode,

    // ── Cargo ─────────────────────────────────────────────
    required String cargoDescription,
    required double weightKg,
    double? volumeCbm,
    String? packagingType,
    int? quantity,
    bool isHazardous = false,
    bool requiresRefrigeration = false,
    double? temperatureMin,
    double? temperatureMax,
    String? incoterms,
    RoutingPreference? routingPreference,

    // ── Sea details ───────────────────────────────────────
    SeaShipmentType? seaShipmentType,
    String? containerType,
    int? containerCount,

    // ── Road details ──────────────────────────────────────
    RoadShipmentType? roadShipmentType,
    String? truckType,

    // ── Notes ─────────────────────────────────────────────
    String? clientNotes,
  }) async {
    emit(const CreateShipmentLoading());

    // ── Build domain params ────────────────────────────────
    final params = CreateShipmentParams(
      origin: ShipmentAddress(
        label: originLabel.trim(),
        city: originCity.trim(),
        governorate: originGov.trim(),
        country: originCountry.trim().toUpperCase(),
        street: originStreet?.trim(),
      ),
      destination: ShipmentAddress(
        label: destLabel.trim(),
        city: destCity.trim(),
        governorate: destGov.trim(),
        country: destCountry.trim().toUpperCase(),
        street: destStreet?.trim(),
      ),
      mode: mode,
      cargo: CargoDetails(
        description: cargoDescription.trim(),
        weightKg: weightKg,
        volumeCbm: volumeCbm,
        packagingType: packagingType,
        quantity: quantity,
        isHazardous: isHazardous,
        requiresRefrigeration: requiresRefrigeration,
        temperatureMin: temperatureMin,
        temperatureMax: temperatureMax,
        incoterms: incoterms,
        routingPreference: routingPreference,
      ),
      seaDetails: mode == ShipmentMode.sea && seaShipmentType != null
          ? SeaDetails(
              shipmentType: seaShipmentType,
              containerType: containerType,
              containerCount: containerCount,
            )
          : null,
      roadDetails: mode == ShipmentMode.road && roadShipmentType != null
          ? RoadDetails(
              shipmentType: roadShipmentType,
              truckType: truckType,
            )
          : null,
      clientNotes: clientNotes,
    );

    // ── Invoke use case ────────────────────────────────────
    final result = await _createShipmentUseCase(params);

    // ── Emit result state ──────────────────────────────────
    result.fold(
      (failure) => emit(CreateShipmentFailure(failure)),
      (shipment) => emit(CreateShipmentSuccess(shipment)),
    );
  }

  /// Resets the Cubit to its initial state (e.g., after navigating back).
  void reset() => emit(const CreateShipmentInitial());
}
