#!/usr/bin/env python3
"""
Test script to verify dashboard time filters are working
"""

from molecule_dashboard import load_data, get_time_filtered_data, calculate_metrics
from datetime import datetime

def test_dashboard_filters():
    print("🔍 Testing Dashboard Time Filters...")
    print("=" * 50)
    
    # Load data
    try:
        data = load_data()
        print(f"✅ Data loaded successfully")
        print(f"📊 Total imports: {len(data['imports'])}")
        print(f"🏢 Total companies: {len(data['companies'])}")
        print(f"🚚 Total distributors: {len(data['distributors'])}")
        print(f"🧪 Total molecules: {len(data['molecules'])}")
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return
    
    # Test each time filter
    time_filters = ['daily', 'weekly', 'monthly', 'yearly']
    
    for time_filter in time_filters:
        print(f"\n📅 Testing {time_filter.upper()} filter:")
        try:
            filtered_data = get_time_filtered_data(data, time_filter)
            filtered_imports = len(filtered_data['imports'])
            
            print(f"   📈 Filtered imports: {filtered_imports}")
            
            if filtered_imports > 0:
                # Calculate metrics for this time period
                metrics = calculate_metrics(filtered_data)
                print(f"   💰 Total value: ₹{metrics['price_stats']['total_value']:,.2f}")
                print(f"   🏆 Top molecule: {metrics['top_molecules'][0]['name'] if metrics['top_molecules'] else 'None'}")
                print(f"   ✅ Status: Working")
            else:
                print(f"   ⚠️  No data for this time period")
                print(f"   ℹ️  This might be normal if no recent imports exist")
                
        except Exception as e:
            print(f"   ❌ Error with {time_filter} filter: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Dashboard Test Complete!")
    
    # Show sample import dates
    print(f"\n📅 Sample import dates from data:")
    sample_dates = [imp['import_date'] for imp in data['imports'][:5]]
    for date in sample_dates:
        print(f"   {date}")
    
    # Show current date for reference
    current_date = datetime.now().strftime("%Y-%m-%d")
    print(f"   Current date: {current_date}")

if __name__ == "__main__":
    test_dashboard_filters()
