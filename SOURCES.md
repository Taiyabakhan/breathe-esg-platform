# Source Research & Sample Data

The fabricated sample datasets intentionally include malformed dates, inconsistent units, missing values, and suspicious quantities to exercise the validation and analyst review workflow realistically.

## 1. SAP Procurement
**Research**: SAP users often extract data via ALV (ABAP List Viewer) grid exports to CSV. These exports maintain the German technical column names if not customized.
**Sample Data**: 
```csv
Werk,Materialkurztext,Menge,Basismengeneinheit,Buchungsdatum,Lieferant
W001,Diesel Fuel,500,L,15.10.2023,Shell
HQ01,Office Supplies,100,EA,16.10.2023,Staples
```
**What would break in production**: If a user's SAP profile is configured for US date formats (MM/DD/YYYY) instead of German (DD.MM.YYYY), our parser would fail. Production deployments would require configurable locale-aware parsing and source-specific mapping rules.

## 2. Utility Electricity (PG&E)
**Research**: Utilities like PG&E offer "Green Button" downloads or simple billing CSVs. Billing periods rarely align exactly with a calendar month.
**Sample Data**:
```csv
Account Number,Start Date,End Date,Usage,Units,Cost
123456789,2023-09-15,2023-10-14,1500,kWh,250.00
123456789,2023-10-15,2023-11-14,0,kWh,15.00
```
**What would break in production**: Cost > 0 but Usage = 0 is common (e.g., fixed connection fees when a building is empty). Our parser flags this as a warning, but production needs complex logic to decide if it's an error or just a baseline charge.

## 3. Corporate Travel (Concur)
**Research**: Concur's Expense v4 API returns expenses within a report. Distances are often logged for mileage reimbursement.
**Sample Data**:
```json
[
  {
    "expenseTypeCode": "CAR",
    "transactionDate": "2023-10-20",
    "totalDistance": 45.5,
    "distanceUnit": "miles",
    "approvedAmount": 50.00
  }
]
```
**What would break in production**: Not all flights have `totalDistance`. Often, you only get `departureAirport` and `arrivalAirport` codes. A production system would need an airport geolocation lookup table to calculate distance using the Haversine formula.

## Real-World Data Quality Observations

Researching ESG operational systems showed that the hardest problem is not carbon calculation itself, but inconsistent operational data quality.

Common issues discovered:
- inconsistent date formats
- missing units
- regional SAP localization differences
- incomplete travel distances
- overlapping utility billing periods
- manual spreadsheet corrections outside source systems

The prototype was designed to surface these issues visibly instead of silently failing.