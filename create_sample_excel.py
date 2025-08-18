#!/usr/bin/env python3
"""
Create sample Excel file for testing Import Goods application
Generates sample data with the expected column structure
"""

import pandas as pd
from datetime import datetime, timedelta
import random

def create_sample_excel():
    """Create a sample Excel file with import data"""
    
    # Sample data
    molecules = [
        "Acetaminophen", "Ibuprofen", "Aspirin", "Omeprazole", "Metformin",
        "Lisinopril", "Amlodipine", "Atorvastatin", "Metoprolol", "Losartan"
    ]
    
    companies = [
        "PharmaCorp USA", "MediTech Germany", "HealthCare UK", "BioPharm France",
        "DrugCo Japan", "Medicine Inc Canada", "Pharma Solutions Australia"
    ]
    
    distributors = [
        "Global Distributors", "Medical Supply Co", "Pharma Logistics", "Health Partners",
        "Medical Express", "Pharma Network", "Health Solutions"
    ]
    
    countries = ["USA", "Germany", "UK", "France", "Japan", "Canada", "Australia", "India", "China", "Brazil"]
    
    shipment_modes = ["Air", "Sea", "Rail", "Road"]
    
    units = ["KG", "TON", "L", "ML", "PCS"]
    
    currencies = ["USD", "EUR", "INR", "GBP", "JPY", "CNY"]
    
    # Generate sample data
    data = []
    start_date = datetime.now() - timedelta(days=365)
    
    for i in range(100):  # Generate 100 sample records
        # Random date within last year
        random_days = random.randint(0, 365)
        date = start_date + timedelta(days=random_days)
        
        # Random quantities and prices
        quantity = round(random.uniform(10, 1000), 2)
        unit_price = round(random.uniform(5, 500), 2)
        
        # Random HS codes (8 digits)
        hs_code = str(random.randint(10000000, 99999999))
        
        record = {
            'Date': date.strftime('%Y-%m-%d'),
            'HS Code': hs_code,
            'Product Description': random.choice(molecules),
            'Consignee Name': random.choice(companies),
            'Shipper Name': random.choice(distributors),
            'Country of Origin': random.choice(countries),
            'Shipment Mode': random.choice(shipment_modes),
            'QTY': quantity,
            'Unit': random.choice(units),
            'Rate In FC': unit_price,
            'Rate Currency': random.choice(currencies)
        }
        
        data.append(record)
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Save to Excel
    filename = 'sample_import_data.xlsx'
    df.to_excel(filename, index=False, sheet_name='Import Data')
    
    print(f"Sample Excel file created: {filename}")
    print(f"Records generated: {len(data)}")
    print(f"Columns: {list(df.columns)}")
    print(f"Date range: {df['Date'].min()} to {df['Date'].max()}")
    
    # Show sample of data
    print("\nFirst 5 records:")
    print(df.head())
    
    return filename

if __name__ == '__main__':
    create_sample_excel()

