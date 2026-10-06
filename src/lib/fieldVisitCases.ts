// Field Visit Alternative — demo case registry.
//
// One entry per client (today: Credo). Each case bundles the client's login
// credential, its map configuration, and the predefined orchards that can be
// searched by cadastral code. Adding a new client = adding a new case here;
// no new routes or components are required.
//
// An orchard evaluation may span several cadastral parcels (Credo's Davitiani
// orchard is four parcels evaluated as one). Searching any of its codes loads
// the same combined evaluation; on the map all its parcels are drawn and the
// searched one is highlighted.
//
// The credential is stored as base64(`${username}:${password}`) so the plaintext
// password never appears in source. This is a demo gate only — it provides no
// real security (anything shipped to the browser is inspectable).

import credoZugdidiRing from '../data/credo-zugdidi-parcel.json';
import davitianiParcels from '../data/credo-davitiani-parcels.json';

export type LangText = { en: string; ka: string; ru?: string };

export type OrchardCondition = 'good' | 'medium' | 'poor';

export type ParcelGeometry = {
  cadastralCode: string;
  ringLatLng: [number, number][];
};

export type Parcel = {
  // Every cadastral code that resolves to this (combined) orchard evaluation.
  cadastralCodes: string[];
  // One entry per cadastral parcel; all are drawn, the searched one highlighted.
  parcels: ParcelGeometry[];
  region: LangText;
  municipality: LangText;
  village: LangText;
  crop: LangText;
  cadastralAreaHa: number;
  orchardAge: LangText;
  plantedAreaHa: number;
  healthyAreaHa: number;
  lowProductivityAreaHa: number;
  condition: OrchardCondition;
  conditionScore?: number; // e.g. 6.2 → badge reads "Medium - 6.2"
  evaluationDate: string;
  pdfUrl: string;
};

export type FieldVisitCase = {
  id: string;
  credential: string; // btoa(`${username}:${password}`)
  map: {
    orthos: { url: string; bounds: [[number, number], [number, number]] }[];
  };
  parcels: Parcel[];
};

// Davitiani orchard — four parcels, one combined evaluation. Geometry per code
// comes from the QGIS cadastre export; agronomic data is shared across all four.
const DAVITIANI_CODES = ['54.05.55.304', '54.05.55.209', '54.05.55.152', '54.05.55.289'];
const davitianiGeom = davitianiParcels as Record<string, [number, number][]>;

const CREDO_CASE: FieldVisitCase = {
  id: 'credo',
  // btoa('credo:Xn19iP')
  credential: btoa('credo:Xn19iP'),
  map: {
    orthos: [
      {
        url: '/cases/credo/Zugdidi_Ortho_Light_1.png',
        bounds: [
          [42.44823258175837, 41.91162499425968],
          [42.45266068638908, 41.91688612504768],
        ],
      },
      {
        url: '/cases/credo/Davitiani_Ortho_Light.png',
        bounds: [
          [41.78669159971454, 46.190725687079514],
          [41.79302895832803, 46.19856054998287],
        ],
      },
    ],
  },
  parcels: [
    {
      cadastralCodes: ['43.12.01.148'],
      parcels: [
        { cadastralCode: '43.12.01.148', ringLatLng: credoZugdidiRing as [number, number][] },
      ],
      region: { en: 'Samegrelo', ka: 'სამეგრელო' },
      municipality: { en: 'Zugdidi', ka: 'ზუგდიდი' },
      village: { en: 'Narazeni', ka: 'ნარაზენი' },
      crop: { en: 'Blueberry', ka: 'მოცვი' },
      cadastralAreaHa: 10,
      orchardAge: { en: '7', ka: '7' },
      plantedAreaHa: 7.5,
      healthyAreaHa: 5.8,
      lowProductivityAreaHa: 1.7,
      condition: 'medium',
      evaluationDate: '9/07/2026',
      pdfUrl: '/cases/credo/43.12.01.148.pdf',
    },
    {
      cadastralCodes: DAVITIANI_CODES,
      parcels: DAVITIANI_CODES.map((code) => ({
        cadastralCode: code,
        ringLatLng: davitianiGeom[code],
      })),
      region: { en: 'Kakheti', ka: 'კახეთი' },
      municipality: { en: 'Lagodekhi', ka: 'ლაგოდეხი' },
      village: { en: 'Davitiani', ka: 'დავითიანი' },
      crop: { en: 'Hazelnut', ka: 'თხილი' },
      cadastralAreaHa: 12.28,
      orchardAge: {
        en: '4.22 ha – average age of 6 years\n2.75 ha – average age of 4 years',
        ka: '4.22 ჰა - საშუალოდ 6 წლის\n2.75 ჰა - საშუალოდ 4 წლის',
      },
      plantedAreaHa: 6.97,
      healthyAreaHa: 5.92,
      lowProductivityAreaHa: 1.05,
      condition: 'medium',
      conditionScore: 6.2,
      evaluationDate: '9/09/2026',
      pdfUrl: '/cases/credo/N378A.pdf',
    },
  ],
};

const CASES: FieldVisitCase[] = [CREDO_CASE];

/** Returns the caseId whose credential matches the given login, or null. */
export function authenticate(username: string, password: string): string | null {
  const credential = btoa(`${username}:${password}`);
  const match = CASES.find((c) => c.credential === credential);
  return match ? match.id : null;
}

export function getCaseById(id: string | undefined): FieldVisitCase | undefined {
  if (!id) return undefined;
  return CASES.find((c) => c.id === id);
}

export type ParcelMatch = { parcel: Parcel; matchedCode: string };

/** Finds the orchard whose codes include the given one, plus the matched code. */
export function findParcel(
  caseId: string | undefined,
  code: string
): ParcelMatch | undefined {
  const c = getCaseById(caseId);
  if (!c) return undefined;
  const needle = code.trim();
  const parcel = c.parcels.find((p) => p.cadastralCodes.includes(needle));
  return parcel ? { parcel, matchedCode: needle } : undefined;
}

/** Renders a LangText for the current language, falling back to English. */
export function langText(value: LangText, lang: string): string {
  if (lang === 'ka') return value.ka;
  if (lang === 'ru') return value.ru ?? value.en;
  return value.en;
}
