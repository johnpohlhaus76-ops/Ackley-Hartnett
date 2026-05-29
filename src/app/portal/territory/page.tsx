import { accounts } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { TerritoryPlanner, type TripAccount } from "@/components/TerritoryPlanner";

// Major North American airports with coordinates
export const NA_AIRPORTS = [
  { code: "EWR", name: "Newark Liberty", city: "Newark, NJ", lat: 40.6895, lng: -74.1745 },
  { code: "PHL", name: "Philadelphia Intl", city: "Philadelphia, PA", lat: 39.8729, lng: -75.2437 },
  { code: "JFK", name: "John F. Kennedy", city: "New York, NY", lat: 40.6413, lng: -73.7781 },
  { code: "LGA", name: "LaGuardia", city: "New York, NY", lat: 40.7772, lng: -73.8726 },
  { code: "BOS", name: "Logan Intl", city: "Boston, MA", lat: 42.3656, lng: -71.0096 },
  { code: "BWI", name: "BWI Marshall", city: "Baltimore, MD", lat: 39.1754, lng: -76.6682 },
  { code: "IAD", name: "Dulles Intl", city: "Washington, DC", lat: 38.9531, lng: -77.4565 },
  { code: "DCA", name: "Reagan National", city: "Washington, DC", lat: 38.8521, lng: -77.0377 },
  { code: "RDU", name: "Raleigh-Durham", city: "Raleigh, NC", lat: 35.8776, lng: -78.7875 },
  { code: "CLT", name: "Charlotte Douglas", city: "Charlotte, NC", lat: 35.2140, lng: -80.9431 },
  { code: "ATL", name: "Hartsfield-Jackson", city: "Atlanta, GA", lat: 33.6407, lng: -84.4277 },
  { code: "ORD", name: "O'Hare Intl", city: "Chicago, IL", lat: 41.9742, lng: -87.9073 },
  { code: "MDW", name: "Midway Intl", city: "Chicago, IL", lat: 41.7868, lng: -87.7522 },
  { code: "DTW", name: "Detroit Metro", city: "Detroit, MI", lat: 42.2162, lng: -83.3554 },
  { code: "CLE", name: "Cleveland Hopkins", city: "Cleveland, OH", lat: 41.4117, lng: -81.8498 },
  { code: "PIT", name: "Pittsburgh Intl", city: "Pittsburgh, PA", lat: 40.4915, lng: -80.2329 },
  { code: "CVG", name: "Cincinnati/N. Kentucky", city: "Cincinnati, OH", lat: 39.0488, lng: -84.6678 },
  { code: "IND", name: "Indianapolis Intl", city: "Indianapolis, IN", lat: 39.7173, lng: -86.2944 },
  { code: "STL", name: "Lambert-St. Louis", city: "St. Louis, MO", lat: 38.7487, lng: -90.3700 },
  { code: "MSP", name: "Minneapolis-St. Paul", city: "Minneapolis, MN", lat: 44.8848, lng: -93.2223 },
  { code: "MCI", name: "Kansas City Intl", city: "Kansas City, MO", lat: 39.2976, lng: -94.7139 },
  { code: "DFW", name: "Dallas/Fort Worth", city: "Dallas, TX", lat: 32.8998, lng: -97.0403 },
  { code: "IAH", name: "George Bush Intercontinental", city: "Houston, TX", lat: 29.9902, lng: -95.3368 },
  { code: "LAX", name: "Los Angeles Intl", city: "Los Angeles, CA", lat: 33.9425, lng: -118.4081 },
  { code: "SFO", name: "San Francisco Intl", city: "San Francisco, CA", lat: 37.6213, lng: -122.3790 },
  { code: "SEA", name: "Seattle-Tacoma", city: "Seattle, WA", lat: 47.4502, lng: -122.3088 },
  { code: "DEN", name: "Denver Intl", city: "Denver, CO", lat: 39.8561, lng: -104.6737 },
  { code: "SLC", name: "Salt Lake City Intl", city: "Salt Lake City, UT", lat: 40.7884, lng: -111.9778 },
  { code: "PHX", name: "Phoenix Sky Harbor", city: "Phoenix, AZ", lat: 33.4373, lng: -112.0078 },
  { code: "MIA", name: "Miami Intl", city: "Miami, FL", lat: 25.7959, lng: -80.2870 },
  { code: "TPA", name: "Tampa Intl", city: "Tampa, FL", lat: 27.9755, lng: -82.5332 },
  { code: "MCO", name: "Orlando Intl", city: "Orlando, FL", lat: 28.4312, lng: -81.3081 },
  { code: "YYZ", name: "Toronto Pearson", city: "Toronto, ON", lat: 43.6777, lng: -79.6248 },
  { code: "YUL", name: "Montréal-Trudeau", city: "Montréal, QC", lat: 45.4706, lng: -73.7408 },
  { code: "SJU", name: "Luis Muñoz Marín", city: "San Juan, PR", lat: 18.4394, lng: -66.0018 },
];

export default function TerritoryPage() {
  const tripAccounts: TripAccount[] = accounts
    .filter((a) =>
      a.coords &&
      ["Pharmaceutical", "Confectionery"].includes(a.industry)
    )
    .map((a) => ({
      id: a.id,
      name: a.name,
      industry: a.industry,
      city: a.city ?? null,
      state: a.state ?? null,
      country: a.country ?? null,
      coords: a.coords as [number, number],
      installCount: a.installCount,
      contactCount: a.contactCount,
      isProspect: a.installCount === 0,
    }));

  return (
    <div>
      <PageHeader
        title="Territory Planner"
        subtitle="Plan North American field trips — select accounts, find nearby airports, estimate drive times, and build your route."
      />
      <TerritoryPlanner accounts={tripAccounts} airports={NA_AIRPORTS} />
    </div>
  );
}
