# N-ACRM National Aged Care Framework

## Current State

The application is a full-stack national aged care analytics platform. The backend (`mockData.ts`) already uses Australian states/territories (NSW, VIC, QLD, SA, WA, TAS, NT, ACT) for `REGIONAL_DATA`, `MOCK_PROVIDERS`, `STATE_ADVERSE_EVENTS`, and all non-city data structures.

However, the `CITY_PROVIDERS` dataset — and all modules that consume it — still contains Indian cities and Indian-named providers:
- Cities: Hyderabad, Kolkata, Delhi, Mumbai, Chennai, Bengaluru, Pune, Ahmedabad
- Provider names reference Indian culture (e.g. "Vanaprastha Mumbai", "Nandanam Senior Living", "Sparsh Care Bengaluru", "Vridh Aashray", "Kalyaan Senior Care", etc.)
- `CITY_TO_STATE` maps Indian cities to Indian states (Telangana, West Bengal, Maharashtra, etc.)
- `ProviderDashboard.tsx` hard-references `CITY_PROVIDERS.Hyderabad?.[0]` and displays `{PROVIDER.city}, India`
- `RegionalProviderDrillDown.tsx` shows "Choose from X regions across India"

All other modules (Heatmaps, NationalOverview, PolicyAnalytics, etc.) already use Australian state data.

## Requested Changes (Diff)

### Add
- 8 Australian cities as city keys: Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra, Hobart, Darwin
- Australian-sounding provider names for all city providers (29 total providers preserved, redistributed across Australian cities)
- Updated `CITY_TO_STATE` mapping Australian cities to Australian states

### Modify
- `CITY_PROVIDERS` in `mockData.ts`: Replace all 8 Indian city keys and their providers with 8 Australian city keys and Australian providers, maintaining the same performance tier distribution (5★, 4★, 3★, 2★, 1★ spread)
- `ProviderDashboard.tsx` line 42: Change `CITY_PROVIDERS.Hyderabad?.[0]` to `CITY_PROVIDERS.Sydney?.[0]`
- `ProviderDashboard.tsx` line 236: Change `{PROVIDER.city}, India` to `{PROVIDER.city}, Australia`
- `RegionalProviderDrillDown.tsx` line 1481: Change "regions across India" to "regions across Australia"
- Provider IDs: Update prefix codes (HYD→SYD, KOL→MEL, DEL→BRI, MUM→PER, CHE→ADL, BLR→CAN, PUN→HOB, AMD→DAR)

### Remove
- All Indian city names from `CITY_PROVIDERS` keys
- All Indian state names from `CITY_TO_STATE`
- All Indian-culture provider names (Vanaprastha, Nandanam, Sparsh, Vridh Aashray, Maitri, VelaCare, Karunalaya, Vatsalya, Arjuna, Sahyadri, Shantivan, Prayag, Shree Senior Seva, Amrut Varsham, Kalyaan, Aarokya, Thanga Thozhil, Bengal Senior Living, Eastern Life Care, Capital Elder Home, Silver Years Residency, Harmony Care Centre, Green Valley Aged Care, Sunrise Elder Support, Anand Ashram Mumbai, SilverBay Care, Sukhayam Senior Care)

## Implementation Plan

1. **mockData.ts — Replace `CITY_PROVIDERS`**: Replace all 8 Indian city keys with Australian cities:
   - `Sydney` (3 providers: HIGH/LOW/HIGH matching 5★/1★/5★ pattern)
   - `Melbourne` (2 providers: 3★/4★)
   - `Brisbane` (2 providers: 5★/2★)
   - `Perth` (4 providers: 5★/3★/4★/2★)
   - `Adelaide` (4 providers: 5★/3★/4★/3★)
   - `Canberra` (4 providers: 5★/3★/4★/2★)
   - `Hobart` (4 providers: 3★/3★/4★/1★)
   - `Darwin` (4 providers: 4★/3★/5★/3★)
   - All provider names must be Australian-sounding (e.g. "Bondi Aged Care", "Harbour View Seniors", "Yarra Valley Care", etc.)
   - Preserve all indicator data structures, weights, and performance tier characteristics exactly
   - Update provider IDs to use Australian city codes: SYD, MEL, BRI, PER, ADL, CAN, HOB, DAR

2. **mockData.ts — Update `CITY_TO_STATE`**: Map each Australian city to correct Australian state:
   - Sydney → New South Wales
   - Melbourne → Victoria
   - Brisbane → Queensland
   - Perth → Western Australia
   - Adelaide → South Australia
   - Canberra → Australian Capital Territory
   - Hobart → Tasmania
   - Darwin → Northern Territory

3. **ProviderDashboard.tsx**: 
   - Change `CITY_PROVIDERS.Hyderabad?.[0]` → `CITY_PROVIDERS.Sydney?.[0]`
   - Change `{PROVIDER.city}, India` → `{PROVIDER.city}, Australia`

4. **RegionalProviderDrillDown.tsx**: 
   - Change "regions across India" → "regions across Australia"

5. **Verify**: Confirm all cross-module references to provider IDs (HRC cohort data, PFI data, audit logs, screening workflows) still resolve — these use PROV-xxx IDs not city IDs, so no changes needed there.
