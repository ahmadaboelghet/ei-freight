/// @file lib/main.dart
///
/// Entry point for EI Freight Mobile application.
///
/// Responsibilities:
///   1. Ensure Flutter bindings are initialized.
///   2. Initialize Firebase via Firebase.initializeApp().
///   3. Initialize Service Locator / Dependency Injection (GetIt).
///   4. Run the root widget with global Theme and Cubit providers.

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

import 'core/di/injection_container.dart' as di;
import 'features/shipment/presentation/cubit/create_shipment_cubit.dart';
import 'features/shipment/presentation/screens/create_shipment_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ── 1. Initialize Firebase ─────────────────────────────────
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // ── 2. Initialize Dependency Injection ─────────────────────
  await di.initDependencies();

  runApp(const EiFreightApp());
}

class EiFreightApp extends StatelessWidget {
  const EiFreightApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EI Freight',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB), // EI Freight brand blue
          primary: const Color(0xFF2563EB),
          secondary: const Color(0xFF1E3A5F), // Brand navy
          surface: Colors.white,
        ),
        fontFamily: 'Cairo',
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFF2563EB), width: 2),
          ),
        ),
      ),
      // Inject the CreateShipmentCubit into the widget tree
      home: BlocProvider(
        create: (_) => di.sl<CreateShipmentCubit>(),
        child: const CreateShipmentScreen(),
      ),
    );
  }
}
