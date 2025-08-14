from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
import json
import os
from datetime import datetime, timedelta
# import pandas as pd  # Not needed for this application
from collections import defaultdict, Counter
import random

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# Data storage
DATA_FILE = 'molecule_data.json'

def load_data():
    """Load data from JSON file or create sample data if file doesn't exist"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    else:
        # Create sample data
        sample_data = create_sample_data()
        save_data(sample_data)
        return sample_data

def save_data(data):
    """Save data to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def create_sample_data():
    """Create sample data for demonstration"""
    companies = [
        {"id": "C001", "name": "PharmaCorp Ltd", "type": "Pharmaceutical", "location": "Mumbai"},
        {"id": "C002", "name": "MediTech Solutions", "type": "Biotechnology", "location": "Bangalore"},
        {"id": "C003", "name": "HealthCare Plus", "type": "Healthcare", "location": "Delhi"},
        {"id": "C004", "name": "BioPharma Inc", "type": "Pharmaceutical", "location": "Hyderabad"},
        {"id": "C005", "name": "Life Sciences Co", "type": "Research", "location": "Chennai"}
    ]
    
    distributors = [
        {"id": "D001", "name": "Global Pharma Supply", "location": "Mumbai", "rating": 4.5},
        {"id": "D002", "name": "MediDistributors", "location": "Delhi", "rating": 4.2},
        {"id": "D003", "name": "BioSupply Chain", "location": "Bangalore", "rating": 4.7},
        {"id": "D004", "name": "Pharma Logistics", "location": "Hyderabad", "rating": 4.0},
        {"id": "D005", "name": "Health Supply Co", "location": "Chennai", "rating": 4.3}
    ]
    
    molecules = [
        {"id": "M001", "name": "Paracetamol", "category": "Analgesic", "molecular_weight": 151.16},
        {"id": "M002", "name": "Ibuprofen", "category": "NSAID", "molecular_weight": 206.29},
        {"id": "M003", "name": "Aspirin", "category": "Salicylate", "molecular_weight": 180.16},
        {"id": "M004", "name": "Omeprazole", "category": "PPI", "molecular_weight": 345.42},
        {"id": "M005", "name": "Metformin", "category": "Antidiabetic", "molecular_weight": 129.16},
        {"id": "M006", "name": "Amlodipine", "category": "Calcium Channel Blocker", "molecular_weight": 408.88},
        {"id": "M007", "name": "Lisinopril", "category": "ACE Inhibitor", "molecular_weight": 405.49},
        {"id": "M008", "name": "Atorvastatin", "category": "Statin", "molecular_weight": 558.64}
    ]
    
    # Generate import records for the last 2 years with more recent data
    imports = []
    start_date = datetime.now() - timedelta(days=730)
    
    # Generate 400 records for the past 2 years
    for i in range(400):
        import_date = start_date + timedelta(days=random.randint(0, 730))
        company = random.choice(companies)
        molecule = random.choice(molecules)
        distributor = random.choice(distributors)
        
        # Generate realistic prices based on molecule category
        base_price = random.uniform(100, 5000)
        if molecule["category"] in ["Antidiabetic", "Statin"]:
            base_price *= random.uniform(2, 5)  # More expensive categories
        elif molecule["category"] in ["Analgesic", "NSAID"]:
            base_price *= random.uniform(0.5, 1.5)  # Cheaper categories
        
        quantity = random.randint(100, 10000)
        total_price = base_price * quantity
        
        imports.append({
            "id": f"IMP{i+1:03d}",
            "company_id": company["id"],
            "molecule_id": molecule["id"],
            "distributor_id": distributor["id"],
            "import_date": import_date.strftime("%Y-%m-%d"),
            "quantity": quantity,
            "unit_price": round(base_price, 2),
            "total_price": round(total_price, 2),
            "status": random.choice(["Completed", "In Transit", "Pending", "Delivered"]),
            "notes": f"Import of {molecule['name']} for {company['name']}"
        })
    
    # Generate 100 records for recent dates (last 30 days) to ensure daily/weekly views have data
    for i in range(100):
        import_date = datetime.now() - timedelta(days=random.randint(0, 30))
        company = random.choice(companies)
        molecule = random.choice(molecules)
        distributor = random.choice(distributors)
        
        # Generate realistic prices based on molecule category
        base_price = random.uniform(100, 5000)
        if molecule["category"] in ["Antidiabetic", "Statin"]:
            base_price *= random.uniform(2, 5)  # More expensive categories
        elif molecule["category"] in ["Analgesic", "NSAID"]:
            base_price *= random.uniform(0.5, 1.5)  # Cheaper categories
        
        quantity = random.randint(100, 10000)
        total_price = base_price * quantity
        
        imports.append({
            "id": f"IMP{400+i+1:03d}",
            "company_id": company["id"],
            "molecule_id": molecule["id"],
            "distributor_id": distributor["id"],
            "import_date": import_date.strftime("%Y-%m-%d"),
            "quantity": quantity,
            "unit_price": round(base_price, 2),
            "total_price": round(total_price, 2),
            "status": random.choice(["Completed", "In Transit", "Pending", "Delivered"]),
            "notes": f"Import of {molecule['name']} for {company['name']}"
        })
    
    return {
        "companies": companies,
        "distributors": distributors,
        "molecules": molecules,
        "imports": imports
    }

def get_time_filtered_data(data, time_filter):
    """Filter data based on time period"""
    today = datetime.now()
    
    if time_filter == "daily":
        start_date = today - timedelta(days=1)
    elif time_filter == "weekly":
        start_date = today - timedelta(weeks=1)
    elif time_filter == "monthly":
        start_date = today - timedelta(days=30)
    elif time_filter == "yearly":
        start_date = today - timedelta(days=365)
    else:
        return data
    
    filtered_imports = []
    for imp in data["imports"]:
        imp_date = datetime.strptime(imp["import_date"], "%Y-%m-%d")
        if imp_date >= start_date:
            filtered_imports.append(imp)
    
    filtered_data = data.copy()
    filtered_data["imports"] = filtered_imports
    return filtered_data

def calculate_metrics(data):
    """Calculate dashboard metrics"""
    if not data["imports"]:
        return {}
    
    # Top molecules by import count
    molecule_counts = Counter(imp["molecule_id"] for imp in data["imports"])
    top_molecules = []
    for molecule_id, count in molecule_counts.most_common(10):
        molecule = next(m for m in data["molecules"] if m["id"] == molecule_id)
        top_molecules.append({
            "name": molecule["name"],
            "count": count,
            "category": molecule["category"]
        })
    
    # Top molecules by company
    company_molecule_counts = defaultdict(Counter)
    for imp in data["imports"]:
        company_molecule_counts[imp["company_id"]][imp["molecule_id"]] += 1
    
    top_by_company = []
    for company_id, molecule_counts in company_molecule_counts.items():
        company = next(c for c in data["companies"] if c["id"] == company_id)
        top_molecule_id = molecule_counts.most_common(1)[0][0]
        top_molecule = next(m for m in data["molecules"] if m["id"] == top_molecule_id)
        top_by_company.append({
            "company_name": company["name"],
            "molecule_name": top_molecule["name"],
            "count": molecule_counts[top_molecule_id]
        })
    
    # Top distributors
    distributor_counts = Counter(imp["distributor_id"] for imp in data["imports"])
    top_distributors = []
    for distributor_id, count in distributor_counts.most_common(5):
        distributor = next(d for d in data["distributors"] if d["id"] == distributor_id)
        total_value = sum(imp["total_price"] for imp in data["imports"] if imp["distributor_id"] == distributor_id)
        top_distributors.append({
            "name": distributor["name"],
            "count": count,
            "total_value": total_value,
            "rating": distributor["rating"]
        })
    
    # Price analysis
    prices = [imp["unit_price"] for imp in data["imports"]]
    price_stats = {
        "avg_price": sum(prices) / len(prices),
        "min_price": min(prices),
        "max_price": max(prices),
        "total_imports": len(data["imports"]),
        "total_value": sum(imp["total_price"] for imp in data["imports"])
    }
    
    # Company import counts
    company_counts = Counter(imp["company_id"] for imp in data["imports"])
    company_stats = []
    for company_id, count in company_counts.most_common():
        company = next(c for c in data["companies"] if c["id"] == company_id)
        total_value = sum(imp["total_price"] for imp in data["imports"] if imp["company_id"] == company_id)
        company_stats.append({
            "name": company["name"],
            "count": count,
            "total_value": total_value,
            "type": company["type"]
        })
    
    return {
        "top_molecules": top_molecules,
        "top_by_company": top_by_company,
        "top_distributors": top_distributors,
        "price_stats": price_stats,
        "company_stats": company_stats
    }

@app.route('/')
def index():
    """Main dashboard page"""
    time_filter = request.args.get('time_filter', 'monthly')
    data = load_data()
    filtered_data = get_time_filtered_data(data, time_filter)
    metrics = calculate_metrics(filtered_data)
    
    return render_template('dashboard.html', 
                         metrics=metrics, 
                         time_filter=time_filter,
                         data=filtered_data)

@app.route('/api/chart-data')
def chart_data():
    """API endpoint for chart data"""
    time_filter = request.args.get('time_filter', 'monthly')
    data = load_data()
    filtered_data = get_time_filtered_data(data, time_filter)
    
    # Molecule import trends
    molecule_trends = {}
    for imp in filtered_data["imports"]:
        molecule = next(m for m in filtered_data["molecules"] if m["id"] == imp["molecule_id"])
        if molecule["name"] not in molecule_trends:
            molecule_trends[molecule["name"]] = 0
        molecule_trends[molecule["name"]] += imp["quantity"]
    
    # Company import trends
    company_trends = {}
    for imp in filtered_data["imports"]:
        company = next(c for c in filtered_data["companies"] if c["id"] == imp["company_id"])
        if company["name"] not in company_trends:
            company_trends[company["name"]] = 0
        company_trends[company["name"]] += imp["quantity"]
    
    # Monthly import trends
    monthly_trends = defaultdict(int)
    for imp in filtered_data["imports"]:
        month = imp["import_date"][:7]  # YYYY-MM
        monthly_trends[month] += imp["total_price"]
    
    return jsonify({
        "molecule_trends": dict(list(molecule_trends.items())[:10]),
        "company_trends": dict(list(company_trends.items())[:10]),
        "monthly_trends": dict(monthly_trends)
    })

@app.route('/molecules')
def molecules():
    """Molecules management page"""
    data = load_data()
    return render_template('molecules.html', molecules=data["molecules"])

@app.route('/companies')
def companies():
    """Companies management page"""
    data = load_data()
    return render_template('companies.html', companies=data["companies"])

@app.route('/distributors')
def distributors():
    """Distributors management page"""
    data = load_data()
    return render_template('distributors.html', distributors=data["distributors"])

@app.route('/imports')
def imports():
    """Imports management page"""
    data = load_data()
    return render_template('imports.html', 
                         imports=data["imports"],
                         companies=data["companies"],
                         molecules=data["molecules"],
                         distributors=data["distributors"])

@app.route('/add_molecule', methods=['POST'])
def add_molecule():
    """Add new molecule"""
    data = load_data()
    
    molecule = {
        "id": f"M{len(data['molecules']) + 1:03d}",
        "name": request.form['name'],
        "category": request.form['category'],
        "molecular_weight": float(request.form['molecular_weight'])
    }
    
    data["molecules"].append(molecule)
    save_data(data)
    flash('Molecule added successfully!', 'success')
    return redirect(url_for('molecules'))

@app.route('/add_company', methods=['POST'])
def add_company():
    """Add new company"""
    data = load_data()
    
    company = {
        "id": f"C{len(data['companies']) + 1:03d}",
        "name": request.form['name'],
        "type": request.form['type'],
        "location": request.form['location']
    }
    
    data["companies"].append(company)
    save_data(data)
    flash('Company added successfully!', 'success')
    return redirect(url_for('companies'))

@app.route('/add_distributor', methods=['POST'])
def add_distributor():
    """Add new distributor"""
    data = load_data()
    
    distributor = {
        "id": f"D{len(data['distributors']) + 1:03d}",
        "name": request.form['name'],
        "location": request.form['location'],
        "rating": float(request.form['rating'])
    }
    
    data["distributors"].append(distributor)
    save_data(data)
    flash('Distributor added successfully!', 'success')
    return redirect(url_for('distributors'))

@app.route('/add_import', methods=['POST'])
def add_import():
    """Add new import record"""
    data = load_data()
    
    import_record = {
        "id": f"IMP{len(data['imports']) + 1:03d}",
        "company_id": request.form['company_id'],
        "molecule_id": request.form['molecule_id'],
        "distributor_id": request.form['distributor_id'],
        "import_date": request.form['import_date'],
        "quantity": int(request.form['quantity']),
        "unit_price": float(request.form['unit_price']),
        "total_price": int(request.form['quantity']) * float(request.form['unit_price']),
        "status": request.form['status'],
        "notes": request.form['notes']
    }
    
    data["imports"].append(import_record)
    save_data(data)
    flash('Import record added successfully!', 'success')
    return redirect(url_for('imports'))

if __name__ == '__main__':
    app.run(debug=True, port=5001)
