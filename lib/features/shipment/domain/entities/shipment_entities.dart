/// @file lib/features/shipment/domain/entities/shipment_entities.dart
///
/// Pure Dart domain entities — NO Flutter, NO Firebase, NO JSON.
/// These are the "truth" objects that the entire app reasons about.
/// They match the Firestore schema from Step 1.

import 'package:equatable/equatable.dart';

// ─────────────────────────────────────────────────────────────
// VALUE OBJECTS
// ─────────────────────────────────────────────────────────────

/// Transport mode for a shipment.
enum ShipmentMode { sea, air, road, multimodal }

/// High-level pipeline bucket (UI tabs).
enum LifecycleStage { request, rfq, offer, quotation, approved, inProgress, history }

/// Routing preference.
enum RoutingPreference { direct, transit }

/// Sea-specific shipment type.
enum SeaShipmentType { fcl, lcl }

/// Road-specific shipment type.
enum RoadShipmentType { ftl, ltl }

/// A geographic address used in origin/destination fields.
class ShipmentAddress extends Equatable {
  final String label;
  final String city;
  final String governorate;
  final String country; // ISO 3166-1 alpha-2
  final String? street;

  const ShipmentAddress({
    required this.label,
    required this.city,
    required this.governorate,
    required this.country,
    this.street,
  });

  @override
  List<Object?> get props => [label, city, governorate, country, street];
}

/// Cargo details common across all modes.
class CargoDetails extends Equatable {
  final String description;
  final double weightKg;
  final double? volumeCbm;
  final String? packagingType;
  final int? quantity;
  final bool isHazardous;
  final bool requiresRefrigeration;
  final double? temperatureMin;
  final double? temperatureMax;
  final String? incoterms;
  final RoutingPreference? routingPreference;

  const CargoDetails({
    required this.description,
    required this.weightKg,
    this.volumeCbm,
    this.packagingType,
    this.quantity,
    this.isHazardous = false,
    this.requiresRefrigeration = false,
    this.temperatureMin,
    this.temperatureMax,
    this.incoterms,
    this.routingPreference,
  });

  @override
  List<Object?> get props => [
        description,
        weightKg,
        volumeCbm,
        packagingType,
        quantity,
        isHazardous,
        requiresRefrigeration,
        temperatureMin,
        temperatureMax,
        incoterms,
        routingPreference,
      ];
}

/// Sea-specific cargo details.
class SeaDetails extends Equatable {
  final SeaShipmentType shipmentType;
  final String? containerType; // e.g. "40HC"
  final int? containerCount;

  const SeaDetails({
    required this.shipmentType,
    this.containerType,
    this.containerCount,
  });

  @override
  List<Object?> get props => [shipmentType, containerType, containerCount];
}

/// Road-specific cargo details.
class RoadDetails extends Equatable {
  final RoadShipmentType shipmentType;
  final String? truckType;

  const RoadDetails({required this.shipmentType, this.truckType});

  @override
  List<Object?> get props => [shipmentType, truckType];
}

// ─────────────────────────────────────────────────────────────
// AGGREGATE ROOT
// ─────────────────────────────────────────────────────────────

/// Lightweight entity returned after successful shipment creation.
/// (Full shipment detail will be a separate entity in a later step.)
class CreatedShipment extends Equatable {
  final String shipmentId;
  final String referenceNo;
  final String message;

  const CreatedShipment({
    required this.shipmentId,
    required this.referenceNo,
    required this.message,
  });

  @override
  List<Object?> get props => [shipmentId, referenceNo, message];
}
