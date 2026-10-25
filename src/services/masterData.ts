/**
 * @file src/services/masterData.ts
 * @description Master data interfaces and default seed arrays for Countries,
 *              Locations, Clients, and Providers in the EI Freight Platform.
 */

import { UserStatus } from "../types/domain";

// ─────────────────────────────────────────────────────────────
// CLIENT & PROVIDER PROFILES
// ─────────────────────────────────────────────────────────────

export interface ClientProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  clientType: "personal" | "business";
  industry: string;
  status: UserStatus;
  used: number;
  limit: number;
  limitEnabled: boolean;
}

export interface ProviderProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  classification: "carrier" | "freight_forwarder" | "agent";
  modes: ("sea" | "air" | "road" | "multimodal")[];
  countries: string[];
  docs: string;
  status: UserStatus;
  rating: number;
}

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: "client-atlas",
    name: "Nour Hassan",
    company: "Atlas Homeware",
    email: "nour@atlashomeware.com",
    phone: "+20 100 123 4567",
    clientType: "personal",
    industry: "commercial",
    status: "approved",
    used: 2,
    limit: 10,
    limitEnabled: true,
  },
  {
    id: "client-nile",
    name: "Omar Khalil",
    company: "Nile Fresh Foods",
    email: "omar@nilefreshfoods.com",
    phone: "+20 111 987 6543",
    clientType: "business",
    industry: "agricultural",
    status: "approved",
    used: 2,
    limit: 10,
    limitEnabled: false,
  },
  {
    id: "client-delta",
    name: "Mariam Adel",
    company: "Delta MedTech",
    email: "mariam@deltamedtech.com",
    phone: "+20 122 555 4321",
    clientType: "business",
    industry: "medical",
    status: "pending_approval",
    used: 0,
    limit: 10,
    limitEnabled: true,
  },
];

export const INITIAL_PROVIDERS: ProviderProfile[] = [
  {
    id: "provider-bluewave",
    name: "Ahmed Farouk",
    company: "BlueWave Logistics",
    email: "ahmed@bluewavelogistics.com",
    phone: "+20 102 333 4444",
    classification: "carrier",
    modes: ["sea"],
    countries: ["EG", "AE", "SA", "NL", "CN"],
    docs: "Fleet License #EG-MAR-4019 · Tax Card Attached",
    status: "approved",
    rating: 4.9,
  },
  {
    id: "provider-silkroute",
    name: "Tarek Mansour",
    company: "SilkRoute Forwarding",
    email: "tarek@silkrouteforwarding.com",
    phone: "+20 100 888 9999",
    classification: "freight_forwarder",
    modes: ["sea", "air"],
    countries: ["EG", "CN", "AE", "DE"],
    docs: "IATA Member #49102 · Commercial Reg. #391029",
    status: "approved",
    rating: 4.7,
  },
  {
    id: "provider-falcon",
    name: "Hesham Zaki",
    company: "Falcon Air Cargo",
    email: "hesham@falconaircargo.com",
    phone: "+20 114 777 6666",
    classification: "carrier",
    modes: ["air"],
    countries: ["EG", "AE", "DE"],
    docs: "Air Cargo Operating Certificate #AOC-882",
    status: "approved",
    rating: 4.8,
  },
  {
    id: "provider-transmena",
    name: "Sara Nabil",
    company: "TransMENA Road Freight",
    email: "sara@transmenaroad.com",
    phone: "+20 120 444 5555",
    classification: "carrier",
    modes: ["road"],
    countries: ["EG", "SA", "AE"],
    docs: "Fleet Operating License #EG-TR-8812",
    status: "approved",
    rating: 4.8,
  },
  {
    id: "provider-redsea",
    name: "Karim Fouad",
    company: "RedSea Express Forwarding",
    email: "karim@redseaexpress.com",
    phone: "+20 109 111 2222",
    classification: "agent",
    modes: ["sea"],
    countries: ["EG", "SA"],
    docs: "Port Agency License #EG-PSA-1029",
    status: "pending_approval",
    rating: 4.5,
  },
];

// ─────────────────────────────────────────────────────────────
// MASTER DATA: COUNTRIES & LOCATIONS
// ─────────────────────────────────────────────────────────────

export interface MasterCountry {
  id: string;
  nameEn: string;
  nameAr: string;
  active: boolean;
}

export interface MasterLocation {
  id: string;
  countryId: string;
  nameEn: string;
  nameAr: string;
  type: "city" | "port" | "airport";
  code?: string;
  active: boolean;
}

export const DEFAULT_COUNTRIES: MasterCountry[] = [
  {
    "id": "EG",
    "nameEn": "Egypt",
    "nameAr": "مصر",
    "active": true
  },
  {
    "id": "CN",
    "nameEn": "China",
    "nameAr": "الصين",
    "active": true
  },
  {
    "id": "AE",
    "nameEn": "United Arab Emirates",
    "nameAr": "الإمارات العربية المتحدة",
    "active": true
  },
  {
    "id": "SA",
    "nameEn": "Saudi Arabia",
    "nameAr": "السعودية",
    "active": true
  },
  {
    "id": "DE",
    "nameEn": "Germany",
    "nameAr": "ألمانيا",
    "active": true
  },
  {
    "id": "TR",
    "nameEn": "Türkiye",
    "nameAr": "تركيا",
    "active": true
  },
  {
    "id": "IN",
    "nameEn": "India",
    "nameAr": "الهند",
    "active": true
  },
  {
    "id": "JO",
    "nameEn": "Jordan",
    "nameAr": "الأردن",
    "active": true
  },
  {
    "id": "US",
    "nameEn": "United States",
    "nameAr": "الولايات المتحدة",
    "active": true
  }
];

export const DEFAULT_LOCATIONS: MasterLocation[] = [
  {
    "id": "EG-CAI",
    "countryId": "EG",
    "nameEn": "Cairo",
    "nameAr": "القاهرة",
    "type": "city",
    "code": "CAI",
    "active": true
  },
  {
    "id": "EG-CAI-AIR",
    "countryId": "EG",
    "nameEn": "Cairo International Airport",
    "nameAr": "مطار القاهرة الدولي",
    "type": "airport",
    "code": "CAI",
    "active": true
  },
  {
    "id": "EG-ALX",
    "countryId": "EG",
    "nameEn": "Alexandria",
    "nameAr": "الإسكندرية",
    "type": "city",
    "code": "ALX",
    "active": true
  },
  {
    "id": "EG-ALX-PORT",
    "countryId": "EG",
    "nameEn": "Alexandria Port",
    "nameAr": "ميناء الإسكندرية",
    "type": "port",
    "code": "EGALY",
    "active": true
  },
  {
    "id": "EG-DKH-PORT",
    "countryId": "EG",
    "nameEn": "Dekheila Port",
    "nameAr": "ميناء الدخيلة",
    "type": "port",
    "code": "EGEDK",
    "active": true
  },
  {
    "id": "EG-PSD",
    "countryId": "EG",
    "nameEn": "Port Said",
    "nameAr": "بورسعيد",
    "type": "city",
    "code": "PSD",
    "active": true
  },
  {
    "id": "EG-PSD-PORT",
    "countryId": "EG",
    "nameEn": "Port Said Port",
    "nameAr": "ميناء بورسعيد",
    "type": "port",
    "code": "EGPSD",
    "active": true
  },
  {
    "id": "EG-SOK-PORT",
    "countryId": "EG",
    "nameEn": "Sokhna Port",
    "nameAr": "ميناء السخنة",
    "type": "port",
    "code": "EGSOK",
    "active": true
  },
  {
    "id": "EG-GIZ",
    "countryId": "EG",
    "nameEn": "Giza",
    "nameAr": "الجيزة",
    "type": "city",
    "code": "GIZ",
    "active": true
  },
  {
    "id": "CN-SHA",
    "countryId": "CN",
    "nameEn": "Shanghai",
    "nameAr": "شنغهاي",
    "type": "city",
    "code": "SHA",
    "active": true
  },
  {
    "id": "CN-SHA-PORT",
    "countryId": "CN",
    "nameEn": "Shanghai Port",
    "nameAr": "ميناء شنغهاي",
    "type": "port",
    "code": "CNSHA",
    "active": true
  },
  {
    "id": "CN-PVG-AIR",
    "countryId": "CN",
    "nameEn": "Shanghai Pudong Airport",
    "nameAr": "مطار شنغهاي بودونغ",
    "type": "airport",
    "code": "PVG",
    "active": true
  },
  {
    "id": "CN-NGB",
    "countryId": "CN",
    "nameEn": "Ningbo",
    "nameAr": "نينغبو",
    "type": "city",
    "code": "NGB",
    "active": true
  },
  {
    "id": "CN-NGB-PORT",
    "countryId": "CN",
    "nameEn": "Ningbo Port",
    "nameAr": "ميناء نينغبو",
    "type": "port",
    "code": "CNNGB",
    "active": true
  },
  {
    "id": "CN-SZX",
    "countryId": "CN",
    "nameEn": "Shenzhen",
    "nameAr": "شنتشن",
    "type": "city",
    "code": "SZX",
    "active": true
  },
  {
    "id": "CN-SZX-PORT",
    "countryId": "CN",
    "nameEn": "Shenzhen Port",
    "nameAr": "ميناء شنتشن",
    "type": "port",
    "code": "CNSZX",
    "active": true
  },
  {
    "id": "CN-SZX-AIR",
    "countryId": "CN",
    "nameEn": "Shenzhen Bao'an Airport",
    "nameAr": "مطار شنتشن باوآن",
    "type": "airport",
    "code": "SZX",
    "active": true
  },
  {
    "id": "CN-CAN",
    "countryId": "CN",
    "nameEn": "Guangzhou",
    "nameAr": "غوانزو",
    "type": "city",
    "code": "CAN",
    "active": true
  },
  {
    "id": "CN-CAN-AIR",
    "countryId": "CN",
    "nameEn": "Guangzhou Baiyun Airport",
    "nameAr": "مطار غوانزو باييون",
    "type": "airport",
    "code": "CAN",
    "active": true
  },
  {
    "id": "AE-DXB",
    "countryId": "AE",
    "nameEn": "Dubai",
    "nameAr": "دبي",
    "type": "city",
    "code": "DXB",
    "active": true
  },
  {
    "id": "AE-JEA-PORT",
    "countryId": "AE",
    "nameEn": "Jebel Ali Port",
    "nameAr": "ميناء جبل علي",
    "type": "port",
    "code": "AEJEA",
    "active": true
  },
  {
    "id": "AE-DXB-AIR",
    "countryId": "AE",
    "nameEn": "Dubai International Airport",
    "nameAr": "مطار دبي الدولي",
    "type": "airport",
    "code": "DXB",
    "active": true
  },
  {
    "id": "AE-AUH",
    "countryId": "AE",
    "nameEn": "Abu Dhabi",
    "nameAr": "أبوظبي",
    "type": "city",
    "code": "AUH",
    "active": true
  },
  {
    "id": "AE-KHL-PORT",
    "countryId": "AE",
    "nameEn": "Khalifa Port",
    "nameAr": "ميناء خليفة",
    "type": "port",
    "code": "AEKHL",
    "active": true
  },
  {
    "id": "SA-RUH",
    "countryId": "SA",
    "nameEn": "Riyadh",
    "nameAr": "الرياض",
    "type": "city",
    "code": "RUH",
    "active": true
  },
  {
    "id": "SA-JED",
    "countryId": "SA",
    "nameEn": "Jeddah",
    "nameAr": "جدة",
    "type": "city",
    "code": "JED",
    "active": true
  },
  {
    "id": "SA-JED-PORT",
    "countryId": "SA",
    "nameEn": "Jeddah Islamic Port",
    "nameAr": "ميناء جدة الإسلامي",
    "type": "port",
    "code": "SAJED",
    "active": true
  },
  {
    "id": "SA-DMM",
    "countryId": "SA",
    "nameEn": "Dammam",
    "nameAr": "الدمام",
    "type": "city",
    "code": "DMM",
    "active": true
  },
  {
    "id": "SA-DMM-PORT",
    "countryId": "SA",
    "nameEn": "King Abdulaziz Port",
    "nameAr": "ميناء الملك عبدالعزيز",
    "type": "port",
    "code": "SADMM",
    "active": true
  },
  {
    "id": "DE-FRA",
    "countryId": "DE",
    "nameEn": "Frankfurt",
    "nameAr": "فرانكفورت",
    "type": "city",
    "code": "FRA",
    "active": true
  },
  {
    "id": "DE-FRA-AIR",
    "countryId": "DE",
    "nameEn": "Frankfurt Airport",
    "nameAr": "مطار فرانكفورت",
    "type": "airport",
    "code": "FRA",
    "active": true
  },
  {
    "id": "DE-HAM-PORT",
    "countryId": "DE",
    "nameEn": "Port of Hamburg",
    "nameAr": "ميناء هامبورغ",
    "type": "port",
    "code": "DEHAM",
    "active": true
  },
  {
    "id": "TR-IST",
    "countryId": "TR",
    "nameEn": "Istanbul",
    "nameAr": "إسطنبول",
    "type": "city",
    "code": "IST",
    "active": true
  },
  {
    "id": "TR-IST-AIR",
    "countryId": "TR",
    "nameEn": "Istanbul Airport",
    "nameAr": "مطار إسطنبول",
    "type": "airport",
    "code": "IST",
    "active": true
  },
  {
    "id": "IN-MAA-PORT",
    "countryId": "IN",
    "nameEn": "Chennai Port",
    "nameAr": "ميناء تشيناي",
    "type": "port",
    "code": "INMAA",
    "active": true
  },
  {
    "id": "JO-AMM",
    "countryId": "JO",
    "nameEn": "Amman",
    "nameAr": "عمّان",
    "type": "city",
    "code": "AMM",
    "active": true
  },
  {
    "id": "US-NYC",
    "countryId": "US",
    "nameEn": "New York",
    "nameAr": "نيويورك",
    "type": "city",
    "code": "NYC",
    "active": true
  },
  {
    "id": "US-NYC-PORT",
    "countryId": "US",
    "nameEn": "Port of New York and New Jersey",
    "nameAr": "ميناء نيويورك ونيوجيرسي",
    "type": "port",
    "code": "USNYC",
    "active": true
  },
  {
    "id": "US-JFK-AIR",
    "countryId": "US",
    "nameEn": "John F. Kennedy International Airport",
    "nameAr": "مطار جون إف كينيدي الدولي",
    "type": "airport",
    "code": "JFK",
    "active": true
  }
];
