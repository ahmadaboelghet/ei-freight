/// @file lib/core/di/injection_container.dart
///
/// Dependency Injection Container using [GetIt].
///
/// Registration order: Data Sources → Repositories → Use Cases → Cubits.
/// All registrations are lazy singletons unless a new instance per call is needed.
///
/// Usage:
///   final cubit = sl<CreateShipmentCubit>();

import 'package:get_it/get_it.dart';
import 'package:cloud_functions/cloud_functions.dart';

import '../../features/shipment/data/datasources/shipment_remote_datasource.dart';
import '../../features/shipment/data/repositories_impl/shipment_repository_impl.dart';
import '../../features/shipment/domain/repositories/shipment_repository.dart';
import '../../features/shipment/domain/usecases/create_shipment_usecase.dart';
import '../../features/shipment/presentation/cubit/create_shipment_cubit.dart';

/// Global service locator — access with [sl<T>()].
final GetIt sl = GetIt.instance;

Future<void> initDependencies() async {
  // ── External dependencies ─────────────────────────────────
  sl.registerLazySingleton<FirebaseFunctions>(
    () => FirebaseFunctions.instanceFor(region: 'europe-west1'),
  );

  // ── Data layer ────────────────────────────────────────────
  sl.registerLazySingleton<ShipmentRemoteDataSource>(
    () => ShipmentRemoteDataSourceImpl(functions: sl()),
  );

  // ── Repository implementations ────────────────────────────
  sl.registerLazySingleton<ShipmentRepository>(
    () => ShipmentRepositoryImpl(sl()),
  );

  // ── Use cases ─────────────────────────────────────────────
  sl.registerLazySingleton(() => CreateShipmentUseCase(sl()));

  // ── Cubits (factories — new instance per screen) ──────────
  sl.registerFactory(() => CreateShipmentCubit(sl()));
}
