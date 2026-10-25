/// @file lib/features/shipment/data/models/shipment_models.dart
///
/// Data Transfer Objects (DTOs) — live in the DATA layer.
///
/// Responsibilities:
///   ✓ Serialize domain entities → Map<String, dynamic> for Firebase callable.
///   ✓ Deserialize Firebase response → domain entity (CreatedShipment).
///   ✓ Enforce the exact payload contract agreed in Step 1.
///
/// NOTHING in this file is imported by Domain or Presentation.

import '../../domain/entities/shipment_entities.dart';

// ─────────────────────────────────────────────────────────────
// SERIALIZERS
// These convert domain objects → Map payload for httpsCallable
// ─────────────────────────────────────────────────────────────

extension ShipmentAddressDto on ShipmentAddress {
  Map<String, dynamic> toMap() => {
        'label': label,
        'city': city,
        'governorate': governorate,
        'country': country.toUpperCase(),
        if (street != null && street!.isNotEmpty) 'street': street,
      };
}

extension CargoDetailsDto on CargoDetails {
  Map<String, dynamic> toMap() => {
        'description': description,
        'weightKg': weightKg,
        if (volumeCbm != null) 'volumeCbm': volumeCbm,
        if (packagingType != null && packagingType!.isNotEmpty)
          'packagingType': packagingType,
        if (quantity != null) 'quantity': quantity,
        if (isHazardous) 'isHazardous': true,
        if (requiresRefrigeration) ...{
          'requiresRefrigeration': true,
          if (temperatureMin != null) 'temperatureMin': temperatureMin,
          if (temperatureMax != null) 'temperatureMax': temperatureMax,
        },
        if (incoterms != null && incoterms!.isNotEmpty) 'incoterms': incoterms,
        if (routingPreference != null)
          'routingPreference': routingPreference!.name,
      };
}

extension SeaDetailsDto on SeaDetails {
  Map<String, dynamic> toMap() => {
        'shipmentType': shipmentType.name.toUpperCase(), // "FCL" | "LCL"
        if (containerType != null && containerType!.isNotEmpty)
          'containerType': containerType,
        if (containerCount != null) 'containerCount': containerCount,
      };
}

extension RoadDetailsDto on RoadDetails {
  Map<String, dynamic> toMap() => {
        'shipmentType': roadShipmentTypeToString(shipmentType),
        if (truckType != null && truckType!.isNotEmpty) 'truckType': truckType,
      };
}

String roadShipmentTypeToString(RoadShipmentType t) =>
    t == RoadShipmentType.ftl ? 'FTL' : 'LTL';

// ─────────────────────────────────────────────────────────────
// FULL PAYLOAD BUILDER
// Builds the exact Map<String, dynamic> the Cloud Function expects
// ─────────────────────────────────────────────────────────────

/// Builds the full callable payload from domain params.
/// Mirrors [CreateShipmentPayload] from the Step 1 TypeScript validator.
Map<String, dynamic> buildCreateShipmentPayload({
  required ShipmentAddress origin,
  required ShipmentAddress destination,
  required ShipmentMode mode,
  required CargoDetails cargo,
  SeaDetails? seaDetails,
  RoadDetails? roadDetails,
  String? clientNotes,
}) =>
    {
      'origin': origin.toMap(),
      'destination': destination.toMap(),
      'mode': mode.name, // "sea" | "air" | "road" | "multimodal"
      'cargo': cargo.toMap(),
      if (seaDetails != null) 'seaDetails': seaDetails.toMap(),
      if (roadDetails != null) 'roadDetails': roadDetails.toMap(),
      if (clientNotes != null && clientNotes.isNotEmpty)
        'clientNotes': clientNotes,
    };

// ─────────────────────────────────────────────────────────────
// RESPONSE DESERIALIZER
// ─────────────────────────────────────────────────────────────

/// Parses the Cloud Function's success response into a [CreatedShipment] entity.
/// Response shape: { success, shipmentId, referenceNo, message }
CreatedShipment parseCreateShipmentResponse(Map<String, dynamic> data) =>
    CreatedShipment(
      shipmentId: data['shipmentId'] as String,
      referenceNo: data['referenceNo'] as String,
      message: data['message'] as String? ?? 'Shipment created successfully.',
    );
