/// @file lib/core/usecase/usecase.dart
///
/// Base interface for all Use Cases in the Domain layer.
///
/// Every use case returns [Either<Failure, T>]:
///   - Left(Failure) → something went wrong (shown to the user).
///   - Right(T)      → success with result data.
///
/// [Params] is typically a data class defined alongside the use case.
/// For use cases with no parameters, use [NoParams].

import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import '../error/failures.dart';

abstract interface class UseCase<T, Params> {
  Future<Either<Failure, T>> call(Params params);
}

/// Sentinel type for parameterless use cases.
final class NoParams extends Equatable {
  const NoParams();

  @override
  List<Object?> get props => [];
}
