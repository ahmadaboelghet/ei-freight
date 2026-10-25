// File generated for EI Freight Firebase configuration.
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux.',
        );
      default:
        return web;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyB8duZvj8v-4hK2dj4bh9Q50wm0OV-tMRA',
    appId: '1:870302331129:web:f0d451e67438bdf0397228',
    messagingSenderId: '870302331129',
    projectId: 'ei-freight',
    authDomain: 'ei-freight.firebaseapp.com',
    storageBucket: 'ei-freight.firebasestorage.app',
    measurementId: 'G-6XN7PE4PC9',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyB8duZvj8v-4hK2dj4bh9Q50wm0OV-tMRA',
    appId: '1:870302331129:android:f0d451e67438bdf0397228',
    messagingSenderId: '870302331129',
    projectId: 'ei-freight',
    storageBucket: 'ei-freight.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyB8duZvj8v-4hK2dj4bh9Q50wm0OV-tMRA',
    appId: '1:870302331129:ios:f0d451e67438bdf0397228',
    messagingSenderId: '870302331129',
    projectId: 'ei-freight',
    storageBucket: 'ei-freight.firebasestorage.app',
    iosBundleId: 'com.eifreight.app',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyB8duZvj8v-4hK2dj4bh9Q50wm0OV-tMRA',
    appId: '1:870302331129:ios:f0d451e67438bdf0397228',
    messagingSenderId: '870302331129',
    projectId: 'ei-freight',
    storageBucket: 'ei-freight.firebasestorage.app',
    iosBundleId: 'com.eifreight.app',
  );
}
