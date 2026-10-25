/// @file lib/features/shipment/presentation/cubit/create_shipment_state.dart
///
/// Sealed state hierarchy for [CreateShipmentCubit].
/// Equatable ensures BlocBuilder only rebuilds on genuine state changes.

import 'package:equatable/equatable.dart';
import '../../domain/entities/shipment_entities.dart';
import '../../../../core/error/failures.dart';

sealed class CreateShipmentState extends Equatable {
  const CreateShipmentState();

  @override
  List<Object?> get props => [];
}

/// Initial state — form is empty and ready for input.
final class CreateShipmentInitial extends CreateShipmentState {
  const CreateShipmentInitial();
}

/// Network call in flight — show a loading indicator, disable the submit button.
final class CreateShipmentLoading extends CreateShipmentState {
  const CreateShipmentLoading();
}

/// The Cloud Function returned successfully — carry the result entity.
final class CreateShipmentSuccess extends CreateShipmentState {
  final CreatedShipment shipment;

  const CreateShipmentSuccess(this.shipment);

  @override
  List<Object?> get props => [shipment];
}

/// Something went wrong — carry a typed [Failure] so the UI can decide
/// how to present it (e.g., show a quota-exceeded dialog vs. a generic snackbar).
final class CreateShipmentFailure extends CreateShipmentState {
  final Failure failure;

  const CreateShipmentFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
