/// @file lib/features/shipment/presentation/screens/create_shipment_screen.dart
///
/// [CreateShipmentScreen] — Presentation layer UI.
///
/// Responsibilities:
///   ✓ Renders the multi-section shipment form.
///   ✓ Listens to [CreateShipmentCubit] state via [BlocConsumer].
///   ✓ Shows loading overlay, success dialog, and error snackbar.
///   ✗ Contains ZERO business logic.
///   ✗ Does NOT know about Firebase, http, or JSON.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/shipment_entities.dart';
import '../../../../core/error/failures.dart';
import '../cubit/create_shipment_cubit.dart';
import '../cubit/create_shipment_state.dart';
import '../widgets/shipment_form_field.dart';

class CreateShipmentScreen extends StatefulWidget {
  const CreateShipmentScreen({super.key});

  @override
  State<CreateShipmentScreen> createState() => _CreateShipmentScreenState();
}

class _CreateShipmentScreenState extends State<CreateShipmentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _scrollController = ScrollController();

  // ── Transport mode ─────────────────────────────────────
  ShipmentMode _mode = ShipmentMode.sea;

  // ── Origin controllers ─────────────────────────────────
  final _originLabel = TextEditingController();
  final _originCity = TextEditingController();
  final _originGov = TextEditingController();
  final _originCountry = TextEditingController(text: 'EG');
  final _originStreet = TextEditingController();

  // ── Destination controllers ────────────────────────────
  final _destLabel = TextEditingController();
  final _destCity = TextEditingController();
  final _destGov = TextEditingController();
  final _destCountry = TextEditingController();
  final _destStreet = TextEditingController();

  // ── Cargo controllers ──────────────────────────────────
  final _cargoDesc = TextEditingController();
  final _weight = TextEditingController();
  final _volume = TextEditingController();
  final _quantity = TextEditingController();
  final _notes = TextEditingController();
  String? _selectedPackaging;
  String? _selectedIncoterms;
  bool _isHazardous = false;
  bool _requiresRefrigeration = false;
  final _tempMin = TextEditingController();
  final _tempMax = TextEditingController();

  // ── Sea details ────────────────────────────────────────
  SeaShipmentType _seaType = SeaShipmentType.fcl;
  String? _containerType;
  final _containerCount = TextEditingController();

  // ── Road details ───────────────────────────────────────
  RoadShipmentType _roadType = RoadShipmentType.ftl;
  String? _truckType;

  // ── Constants ──────────────────────────────────────────
  static const _incoterms = ['EXW','FCA','CPT','CIP','DAP','DPU','DDP','FAS','FOB','CFR','CIF'];
  static const _packagingTypes = ['pallets','boxes','drums','bags','crates','loose'];
  static const _containerTypes = ['20GP','40GP','40HC','45HC','20RF','40RF'];
  static const _truckTypes = ['curtainsider','flatbed','box_truck','reefer_truck','lowbed','tanker'];

  @override
  void dispose() {
    _scrollController.dispose();
    for (final c in [
      _originLabel, _originCity, _originGov, _originCountry, _originStreet,
      _destLabel, _destCity, _destGov, _destCountry, _destStreet,
      _cargoDesc, _weight, _volume, _quantity, _notes,
      _tempMin, _tempMax, _containerCount,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  // ─────────────────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────────────────

  void _onSubmit() {
    if (!_formKey.currentState!.validate()) {
      // Scroll to top to reveal the first error
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
      return;
    }

    context.read<CreateShipmentCubit>().submitShipment(
      originLabel: _originLabel.text,
      originCity: _originCity.text,
      originGov: _originGov.text,
      originCountry: _originCountry.text,
      originStreet: _originStreet.text.isEmpty ? null : _originStreet.text,
      destLabel: _destLabel.text,
      destCity: _destCity.text,
      destGov: _destGov.text,
      destCountry: _destCountry.text,
      destStreet: _destStreet.text.isEmpty ? null : _destStreet.text,
      mode: _mode,
      cargoDescription: _cargoDesc.text,
      weightKg: double.tryParse(_weight.text) ?? 0,
      volumeCbm: _volume.text.isNotEmpty ? double.tryParse(_volume.text) : null,
      packagingType: _selectedPackaging,
      quantity: _quantity.text.isNotEmpty ? int.tryParse(_quantity.text) : null,
      isHazardous: _isHazardous,
      requiresRefrigeration: _requiresRefrigeration,
      temperatureMin: _tempMin.text.isNotEmpty ? double.tryParse(_tempMin.text) : null,
      temperatureMax: _tempMax.text.isNotEmpty ? double.tryParse(_tempMax.text) : null,
      incoterms: _selectedIncoterms,
      seaShipmentType: _mode == ShipmentMode.sea ? _seaType : null,
      containerType: _containerType,
      containerCount: _containerCount.text.isNotEmpty ? int.tryParse(_containerCount.text) : null,
      roadShipmentType: _mode == ShipmentMode.road ? _roadType : null,
      truckType: _truckType,
      clientNotes: _notes.text.isEmpty ? null : _notes.text,
    );
  }

  // ─────────────────────────────────────────────────────────
  // BUILD
  // ─────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<CreateShipmentCubit, CreateShipmentState>(
      listener: _handleStateChange,
      builder: (context, state) {
        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          appBar: _buildAppBar(),
          body: Stack(
            children: [
              _buildForm(),
              if (state is CreateShipmentLoading) _buildLoadingOverlay(),
            ],
          ),
          bottomNavigationBar: _buildSubmitBar(state),
        );
      },
    );
  }

  // ── State listener ──────────────────────────────────────

  void _handleStateChange(BuildContext context, CreateShipmentState state) {
    if (state is CreateShipmentSuccess) {
      _showSuccessDialog(state.shipment.referenceNo, state.shipment.shipmentId);
    } else if (state is CreateShipmentFailure) {
      _showErrorFeedback(state.failure);
    }
  }

  // ── AppBar ──────────────────────────────────────────────

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      leading: const BackButton(color: Color(0xFF1E3A5F)),
      title: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'NEW REQUEST',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
              color: Color(0xFF2563EB),
            ),
          ),
          Text(
            'Create Shipment',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1E3A5F),
            ),
          ),
        ],
      ),
      bottom: const PreferredSize(
        preferredSize: Size.fromHeight(1),
        child: Divider(height: 1, color: Color(0xFFE5E7EB)),
      ),
    );
  }

  // ── Main form ───────────────────────────────────────────

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: ListView(
        controller: _scrollController,
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
        children: [
          _modeSection(),
          _addressSection(
            title: '📍 Pick-up Location',
            subtitle: 'Where should we collect the cargo?',
            labelCtrl: _originLabel, cityCtrl: _originCity,
            govCtrl: _originGov, countryCtrl: _originCountry,
            streetCtrl: _originStreet,
          ),
          _addressSection(
            title: '🏁 Delivery Location',
            subtitle: 'Where should the cargo be delivered?',
            labelCtrl: _destLabel, cityCtrl: _destCity,
            govCtrl: _destGov, countryCtrl: _destCountry,
            streetCtrl: _destStreet,
          ),
          _cargoSection(),
          if (_mode == ShipmentMode.sea) _seaSection(),
          if (_mode == ShipmentMode.road) _roadSection(),
          _notesSection(),
        ],
      ),
    );
  }

  // ── Section: Transport Mode ─────────────────────────────

  Widget _modeSection() {
    final modes = [
      (ShipmentMode.sea, '🚢', 'Sea'),
      (ShipmentMode.air, '✈️', 'Air'),
      (ShipmentMode.road, '🚛', 'Road'),
      (ShipmentMode.multimodal, '🔗', 'Multi'),
    ];
    return FormSection(
      title: 'Transport Mode',
      children: [
        GridView.count(
          crossAxisCount: 4,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          children: modes
              .map((m) => ModeTile(
                    emoji: m.$2,
                    label: m.$3,
                    selected: _mode == m.$1,
                    onTap: () => setState(() => _mode = m.$1),
                  ))
              .toList(),
        ),
      ],
    );
  }

  // ── Section: Address ────────────────────────────────────

  Widget _addressSection({
    required String title,
    required String subtitle,
    required TextEditingController labelCtrl,
    required TextEditingController cityCtrl,
    required TextEditingController govCtrl,
    required TextEditingController countryCtrl,
    required TextEditingController streetCtrl,
  }) {
    return FormSection(
      title: title,
      subtitle: subtitle,
      children: [
        ShipmentFormField(
          label: 'Location Label',
          hint: 'e.g. Port Said Dry Port',
          controller: labelCtrl,
          required: true,
        ),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: ShipmentFormField(
              label: 'City',
              hint: 'Cairo',
              controller: cityCtrl,
              required: true,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ShipmentFormField(
              label: 'Governorate',
              hint: 'Cairo',
              controller: govCtrl,
              required: true,
            ),
          ),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          SizedBox(
            width: 90,
            child: ShipmentFormField(
              label: 'Country',
              hint: 'EG',
              controller: countryCtrl,
              required: true,
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Required';
                if (!RegExp(r'^[A-Za-z]{2}$').hasMatch(v.trim())) {
                  return '2 letters only';
                }
                return null;
              },
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ShipmentFormField(
              label: 'Street (optional)',
              hint: 'Street address',
              controller: streetCtrl,
            ),
          ),
        ]),
      ],
    );
  }

  // ── Section: Cargo ──────────────────────────────────────

  Widget _cargoSection() {
    return FormSection(
      title: '📦 Cargo Details',
      subtitle: 'Describe the goods being shipped.',
      children: [
        ShipmentFormField(
          label: 'Cargo Description',
          hint: 'e.g. Electronic components, machine parts…',
          controller: _cargoDesc,
          required: true,
          maxLines: 2,
        ),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: ShipmentFormField(
              label: 'Weight (kg)',
              hint: '12500',
              controller: _weight,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              required: true,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Required';
                final n = double.tryParse(v);
                if (n == null || n <= 0) return 'Must be > 0';
                return null;
              },
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ShipmentFormField(
              label: 'Volume (CBM)',
              hint: '48.5',
              controller: _volume,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
            ),
          ),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _dropdownField(
            label: 'Packaging',
            hint: '— Select —',
            value: _selectedPackaging,
            items: _packagingTypes,
            onChanged: (v) => setState(() => _selectedPackaging = v),
          )),
          const SizedBox(width: 12),
          Expanded(child: ShipmentFormField(
            label: 'Quantity (units)',
            hint: '24',
            controller: _quantity,
            keyboardType: TextInputType.number,
          )),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _dropdownField(
            label: 'Incoterms',
            hint: '— Select —',
            value: _selectedIncoterms,
            items: _incoterms,
            onChanged: (v) => setState(() => _selectedIncoterms = v),
          )),
        ]),
        const SizedBox(height: 14),
        // Toggles
        _checkboxTile(
          label: '⚠️  Hazardous Goods',
          value: _isHazardous,
          onChanged: (v) => setState(() => _isHazardous = v ?? false),
        ),
        const SizedBox(height: 8),
        _checkboxTile(
          label: '❄️  Requires Refrigeration',
          value: _requiresRefrigeration,
          onChanged: (v) => setState(() => _requiresRefrigeration = v ?? false),
        ),
        if (_requiresRefrigeration) ...[
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: ShipmentFormField(
              label: 'Min Temp (°C)',
              hint: '-18',
              controller: _tempMin,
              keyboardType: const TextInputType.numberWithOptions(
                signed: true, decimal: true),
              required: true,
            )),
            const SizedBox(width: 12),
            Expanded(child: ShipmentFormField(
              label: 'Max Temp (°C)',
              hint: '4',
              controller: _tempMax,
              keyboardType: const TextInputType.numberWithOptions(
                signed: true, decimal: true),
              required: true,
            )),
          ]),
        ],
      ],
    );
  }

  // ── Section: Sea ────────────────────────────────────────

  Widget _seaSection() {
    return FormSection(
      title: '🚢 Sea Freight Details',
      subtitle: 'FCL = full container, LCL = shared container.',
      children: [
        _segmentedField<SeaShipmentType>(
          label: 'Shipment Type',
          values: const [SeaShipmentType.fcl, SeaShipmentType.lcl],
          labels: const ['FCL', 'LCL'],
          selected: _seaType,
          onChanged: (v) => setState(() => _seaType = v),
        ),
        if (_seaType == SeaShipmentType.fcl) ...[
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: _dropdownField(
              label: 'Container Type',
              hint: '— Any —',
              value: _containerType,
              items: _containerTypes,
              onChanged: (v) => setState(() => _containerType = v),
            )),
            const SizedBox(width: 12),
            Expanded(child: ShipmentFormField(
              label: 'Container Count',
              hint: '2',
              controller: _containerCount,
              keyboardType: TextInputType.number,
            )),
          ]),
        ],
      ],
    );
  }

  // ── Section: Road ───────────────────────────────────────

  Widget _roadSection() {
    return FormSection(
      title: '🚛 Road Freight Details',
      children: [
        _segmentedField<RoadShipmentType>(
          label: 'Shipment Type',
          values: const [RoadShipmentType.ftl, RoadShipmentType.ltl],
          labels: const ['FTL', 'LTL'],
          selected: _roadType,
          onChanged: (v) => setState(() => _roadType = v),
        ),
        const SizedBox(height: 12),
        _dropdownField(
          label: 'Truck Type',
          hint: '— Any —',
          value: _truckType,
          items: _truckTypes,
          onChanged: (v) => setState(() => _truckType = v),
        ),
      ],
    );
  }

  // ── Section: Notes ──────────────────────────────────────

  Widget _notesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '📝 Additional Notes',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: Color(0xFF1E3A5F),
          ),
        ),
        const SizedBox(height: 12),
        ShipmentFormField(
          label: 'Notes (optional)',
          hint: 'Any special requirements, preferred carriers, deadlines…',
          controller: _notes,
          maxLines: 3,
        ),
        const SizedBox(height: 12),
      ],
    );
  }

  // ── Submit bar ──────────────────────────────────────────

  Widget _buildSubmitBar(CreateShipmentState state) {
    final isLoading = state is CreateShipmentLoading;
    return Container(
      padding: EdgeInsets.fromLTRB(
        16, 12, 16, 12 + MediaQuery.of(context).padding.bottom),
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(top: BorderSide(color: Color(0xFFE5E7EB))),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SizedBox(
        width: double.infinity,
        height: 52,
        child: ElevatedButton(
          onPressed: isLoading ? null : _onSubmit,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2563EB),
            disabledBackgroundColor: const Color(0xFF93C5FD),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            elevation: 0,
          ),
          child: isLoading
              ? const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 18, height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation(Colors.white),
                      ),
                    ),
                    SizedBox(width: 10),
                    Text('Submitting…', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                  ],
                )
              : const Text(
                  '🚀  Submit Request',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
        ),
      ),
    );
  }

  // ── Loading overlay ─────────────────────────────────────

  Widget _buildLoadingOverlay() {
    return Container(
      color: Colors.black.withOpacity(0.15),
      child: const Center(
        child: Card(
          elevation: 8,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(16)),
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 32, vertical: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(color: Color(0xFF2563EB)),
                SizedBox(height: 16),
                Text(
                  'Creating shipment…',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF374151),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Dialogs & Snackbars ─────────────────────────────────

  void _showSuccessDialog(String refNo, String shipmentId) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        contentPadding: const EdgeInsets.all(28),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64, height: 64,
              decoration: BoxDecoration(
                color: const Color(0xFFD1FAE5),
                borderRadius: BorderRadius.circular(32),
              ),
              child: const Icon(Icons.check_rounded, size: 36, color: Color(0xFF059669)),
            ),
            const SizedBox(height: 16),
            const Text(
              'Shipment Created!',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF1E3A5F)),
            ),
            const SizedBox(height: 8),
            Text(
              refNo,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF2563EB)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Our team will review your request and match you with the best freight providers.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
            ),
            const SizedBox(height: 20),
            Row(children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    context.read<CreateShipmentCubit>().reset();
                  },
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('New Request'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    // TODO: Navigate to shipment detail screen in Step 4
                    Navigator.of(context).pop(); // Back to dashboard for now
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('View Request'),
                ),
              ),
            ]),
          ],
        ),
      ),
    );
  }

  void _showErrorFeedback(Failure failure) {
    // Quota exceeded gets a more prominent dialog
    if (failure is QuotaExceededFailure) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Monthly Quota Reached', style: TextStyle(fontWeight: FontWeight.w700)),
          content: Text(failure.message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(children: [
            const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                failure.message,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
              ),
            ),
          ]),
          backgroundColor: const Color(0xFFDC2626),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 5),
        ),
      );
  }

  // ─────────────────────────────────────────────────────────
  // REUSABLE WIDGET HELPERS
  // ─────────────────────────────────────────────────────────

  Widget _dropdownField({
    required String label,
    required String hint,
    required String? value,
    required List<String> items,
    required void Function(String?) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: value,
          hint: Text(hint, style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14)),
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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
            filled: true,
            fillColor: Colors.white,
          ),
          items: items.map((i) => DropdownMenuItem(value: i, child: Text(i, style: const TextStyle(fontSize: 14)))).toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _checkboxTile({
    required String label,
    required bool value,
    required void Function(bool?) onChanged,
  }) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: Row(children: [
        Checkbox(
          value: value,
          onChanged: onChanged,
          activeColor: const Color(0xFF2563EB),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        ),
        Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF374151))),
      ]),
    );
  }

  Widget _segmentedField<T>({
    required String label,
    required List<T> values,
    required List<String> labels,
    required T selected,
    required void Function(T) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
        const SizedBox(height: 8),
        Row(
          children: List.generate(values.length, (i) {
            final isSelected = values[i] == selected;
            return Expanded(
              child: GestureDetector(
                onTap: () => onChanged(values[i]),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  margin: EdgeInsets.only(right: i < values.length - 1 ? 8 : 0),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF2563EB) : Colors.white,
                    border: Border.all(
                      color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFD1D5DB),
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    labels[i],
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? Colors.white : const Color(0xFF374151),
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ],
    );
  }
}
