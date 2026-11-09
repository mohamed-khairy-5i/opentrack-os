export type Language = "ar" | "en";

export interface Translations {
  // Brand & General
  appTitle: string;
  appSubtitle: string;
  region: string;
  cairoEg: string;
  openDriverApp: string;
  starOnGithub: string;

  // Status & Fleet
  activeCouriers: string;
  allLive: string;
  systemStatus: string;
  operational: string;
  pwaLinked: string;
  autonomousEngine: string;

  // Navigation & Metrics
  targetDestination: string;
  currentStreetLabel: string;
  distance: string;
  eta: string;
  speed: string;
  kmUnit: string;
  minUnit: string;
  kmhUnit: string;
  geofenceArrivalAlert: string;

  // Controls & Toggles
  controls: string;
  replay: string;
  simMode: string;
  pwaMode: string;
  routingOn: string;
  routingOff: string;
  searchPlaceholder: string;
  systemTelemetry: string;
  tripPlayback: string;
  scrubber: string;

  // Driver PWA
  driverTitle: string;
  driverSubtitle: string;
  goOnline: string;
  endShift: string;
  standby: string;
  liveTransmitting: string;
  accuracy: string;
  packetsSent: string;
  backToDashboard: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    appTitle: "أوبن تراك",
    appSubtitle: "نظام تتبع الأساطيل المجاني",
    region: "المنطقة",
    cairoEg: "القاهرة، مصر",
    openDriverApp: "فتح تطبيق السائق (PWA)",
    starOnGithub: "ادعمنا بنجمة على GitHub",

    activeCouriers: "السائقين النشطين",
    allLive: "متصل الآن",
    systemStatus: "حالة النظام",
    operational: "يعمل بكفاءة",
    pwaLinked: "متصل بهاتف السائق",
    autonomousEngine: "محرك محاكاة ذاتي",

    targetDestination: "الوجهة المستهدفة",
    currentStreetLabel: "الشارع الحالي",
    distance: "المسافة",
    eta: "الوقت المتوقع",
    speed: "السرعة",
    kmUnit: "كم",
    minUnit: "دقيقة",
    kmhUnit: "كم/س",
    geofenceArrivalAlert: "🎯 داخل نطاق التسليم (أقل من 400م)",

    controls: "التحكم",
    replay: "إعادة مسار",
    simMode: "محاكاة",
    pwaMode: "مباشر هاتف",
    routingOn: "توجيه نعم",
    routingOff: "توجيه لا",
    searchPlaceholder: "ابحث عن شارع أو ميدان في القاهرة...",
    systemTelemetry: "سجلات التتبع المباشر",
    tripPlayback: "إعادة تشغيل مسار الرحلة",
    scrubber: "التقدم",

    driverTitle: "تطبيق السائق",
    driverSubtitle: "جهاز بث الإحداثيات المجاني عبر GPS",
    goOnline: "بدء الوردية (أونلاين)",
    endShift: "إنهاء الوردية (أوفلاين)",
    standby: "في الانتظار",
    liveTransmitting: "بث مباشر نشط",
    accuracy: "دقة الموقع",
    packetsSent: "إشارات تم إرسالها",
    backToDashboard: "العودة للوحة التحكم",
  },
  en: {
    appTitle: "OpenTrack OS",
    appSubtitle: "Zero-Cost Fleet Engine",
    region: "Region",
    cairoEg: "Cairo, EG",
    openDriverApp: "Open Driver App (Phone PWA)",
    starOnGithub: "Star on GitHub",

    activeCouriers: "Active Couriers",
    allLive: "ALL LIVE",
    systemStatus: "System Status",
    operational: "Operational",
    pwaLinked: "PWA Linked",
    autonomousEngine: "Autonomous Engine",

    targetDestination: "Target Destination",
    currentStreetLabel: "Current Street",
    distance: "Distance",
    eta: "ETA",
    speed: "Speed",
    kmUnit: "km",
    minUnit: "min",
    kmhUnit: "km/h",
    geofenceArrivalAlert: "🎯 Inside Delivery Geofence (< 400m)",

    controls: "Controls",
    replay: "REPLAY",
    simMode: "SIM",
    pwaMode: "PWA LIVE",
    routingOn: "ON",
    routingOff: "OFF",
    searchPlaceholder: "Search for a street or landmark...",
    systemTelemetry: "System Telemetry",
    tripPlayback: "Trip History Replay",
    scrubber: "Scrubber",

    driverTitle: "OpenTrack Driver",
    driverSubtitle: "Zero-Cost Mobile Telemetry Beacon",
    goOnline: "GO ONLINE",
    endShift: "END SHIFT",
    standby: "STANDBY",
    liveTransmitting: "LIVE TRANSMITTING",
    accuracy: "GPS Accuracy",
    packetsSent: "Signals Sent",
    backToDashboard: "Dashboard",
  },
};

export function getDictionary(lang: Language = "ar"): Translations {
  return translations[lang] || translations.ar;
}
