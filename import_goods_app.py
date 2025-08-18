#!/usr/bin/env python3
"""
Import Goods Dashboard Application
A comprehensive dashboard for tracking imported molecules, companies, distributors, and imports.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
import pandas as pd
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from werkzeug.utils import secure_filename
import openpyxl

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Allowed currencies
ALLOWED_CURRENCIES = ["USD", "EUR", "INR", "GBP", "JPY", "CNY"]

# Common units
COMMON_UNITS = ["KG", "TON", "L", "ML", "PCS"]

# Data models
@dataclass
class Molecule:
    id: str
    name: str
    description: Optional[str] = None

@dataclass
class Company:
    id: str
    name: str
    location: Optional[str] = None

@dataclass
class Distributor:
    id: str
    name: str
    location: Optional[str] = None

@dataclass
class Import:
    id: str
    date: str
    molecule_id: str
    company_id: str
    distributor_id: str
    country: str
    shipment_mode: Optional[str] = None
    quantity: float
    unit: str
    unit_price: float
    currency: str
    hs_code: Optional[str] = None

class ImportGoodsApp:
    def __init__(self, data_file: str = "import_goods_data.json"):
        self.data_file = data_file
        self.data = self.load_data()
    
    def load_data(self) -> Dict[str, Any]:
        """Load data from JSON file or initialize empty structure"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    logger.info(f"Loaded data from {self.data_file}")
                    return data
        except Exception as e:
            logger.warning(f"Error loading data: {e}")
        
        # Initialize empty structure
        empty_data = {
            "molecules": [],
            "companies": [],
            "distributors": [],
            "imports": []
        }
        logger.info("Initialized empty data structure")
        return empty_data
    
    def save_data(self, data: Dict[str, Any]) -> bool:
        """Save data to JSON file atomically"""
        try:
            # Write to temporary file first
            temp_file = f"{self.data_file}.tmp"
            with open(temp_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            # Atomic move
            if os.path.exists(self.data_file):
                os.replace(temp_file, self.data_file)
            else:
                os.rename(temp_file, self.data_file)
            
            logger.info(f"Data saved to {self.data_file}")
            return True
        except Exception as e:
            logger.error(f"Error saving data: {e}")
            return False
    
    def validate_and_fix_data(self, data: Dict[str, Any]) -> List[str]:
        """Validate and fix data structure, return list of issues"""
        issues = []
        
        # Ensure all required lists exist
        for key in ["molecules", "companies", "distributors", "imports"]:
            if key not in data or not isinstance(data[key], list):
                data[key] = []
        
        # Validate molecules
        for molecule in data["molecules"]:
            if not isinstance(molecule, dict):
                issues.append(f"Invalid molecule format: {molecule}")
                continue
            
            if "id" not in molecule or "name" not in molecule:
                issues.append(f"Missing required fields in molecule: {molecule}")
                continue
            
            if not molecule["name"].strip():
                issues.append(f"Empty molecule name: {molecule}")
                continue
        
        # Validate companies
        for company in data["companies"]:
            if not isinstance(company, dict):
                issues.append(f"Invalid company format: {company}")
                continue
            
            if "id" not in company or "name" not in company:
                issues.append(f"Missing required fields in company: {company}")
                continue
            
            if not company["name"].strip():
                issues.append(f"Empty company name: {company}")
                continue
        
        # Validate distributors
        for distributor in data["distributors"]:
            if not isinstance(distributor, dict):
                issues.append(f"Invalid distributor format: {distributor}")
                continue
            
            if "id" not in distributor or "name" not in distributor:
                issues.append(f"Missing required fields in distributor: {distributor}")
                continue
            
            if not distributor["name"].strip():
                issues.append(f"Empty distributor name: {distributor}")
                continue
        
        # Validate imports
        for import_record in data["imports"]:
            if not isinstance(import_record, dict):
                issues.append(f"Invalid import format: {import_record}")
                continue
            
            required_fields = ["id", "date", "molecule_id", "company_id", "distributor_id", 
                             "country", "quantity", "unit", "unit_price", "currency"]
            
            for field in required_fields:
                if field not in import_record:
                    issues.append(f"Missing required field '{field}' in import: {import_record}")
                    continue
            
            # Validate date format
            try:
                datetime.strptime(import_record["date"], "%Y-%m-%d")
            except ValueError:
                issues.append(f"Invalid date format in import: {import_record['date']}")
            
            # Validate quantity
            try:
                quantity = float(import_record["quantity"])
                if quantity <= 0:
                    issues.append(f"Invalid quantity in import: {quantity}")
            except (ValueError, TypeError):
                issues.append(f"Invalid quantity format in import: {import_record['quantity']}")
            
            # Validate unit price
            try:
                unit_price = float(import_record["unit_price"])
                if unit_price < 0:
                    issues.append(f"Invalid unit price in import: {unit_price}")
            except (ValueError, TypeError):
                issues.append(f"Invalid unit price format in import: {import_record['unit_price']}")
            
            # Validate currency
            if import_record["currency"].upper() not in ALLOWED_CURRENCIES:
                issues.append(f"Invalid currency in import: {import_record['currency']}")
        
        return issues
    
    def get_time_filtered_data(self, time_filter: str, search_molecule: str = "", 
                              search_country: str = "") -> Dict[str, Any]:
        """Get data filtered by time and search criteria"""
        # Calculate date window
        today = datetime.now().date()
        
        if time_filter == "daily":
            start_date = today - timedelta(days=1)
        elif time_filter == "weekly":
            start_date = today - timedelta(days=7)
        elif time_filter == "monthly":
            start_date = today - timedelta(days=30)
        elif time_filter == "quarterly":
            start_date = today - timedelta(days=90)
        elif time_filter == "yearly":
            start_date = today - timedelta(days=365)
        else:
            start_date = today - timedelta(days=30)  # Default to monthly
        
        # Filter imports by date and search
        filtered_imports = []
        for import_record in self.data["imports"]:
            try:
                import_date = datetime.strptime(import_record["date"], "%Y-%m-%d").date()
                if import_date < start_date or import_date > today:
                    continue
                
                # Apply search filters
                if search_molecule:
                    molecule = next((m for m in self.data["molecules"] if m["id"] == import_record["molecule_id"]), None)
                    if molecule and search_molecule.lower() not in molecule["name"].lower():
                        continue
                
                if search_country and search_country.lower() not in import_record["country"].lower():
                    continue
                
                filtered_imports.append(import_record)
            except ValueError:
                continue
        
        return {
            "imports": filtered_imports,
            "molecules": self.data["molecules"],
            "companies": self.data["companies"],
            "distributors": self.data["distributors"]
        }
    
    def get_custom_date_data(self, start_date: str, end_date: str, 
                            search_molecule: str = "", search_country: str = "") -> Dict[str, Any]:
        """Get data for custom date range"""
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_dt = datetime.strptime(end_date, "%Y-%m-%d").date()
            
            if start_dt > end_dt:
                return {"error": "Start date must be before end date"}
            
            if (end_dt - start_dt).days > 366:
                return {"error": "Date range cannot exceed 366 days"}
            
        except ValueError:
            return {"error": "Invalid date format. Use YYYY-MM-DD"}
        
        # Filter imports by date range and search
        filtered_imports = []
        for import_record in self.data["imports"]:
            try:
                import_date = datetime.strptime(import_record["date"], "%Y-%m-%d").date()
                if import_date < start_dt or import_date > end_dt:
                    continue
                
                # Apply search filters
                if search_molecule:
                    molecule = next((m for m in self.data["molecules"] if m["id"] == import_record["molecule_id"]), None)
                    if molecule and search_molecule.lower() not in molecule["name"].lower():
                        continue
                
                if search_country and search_country.lower() not in import_record["country"].lower():
                    continue
                
                filtered_imports.append(import_record)
            except ValueError:
                continue
        
        return {
            "imports": filtered_imports,
            "molecules": self.data["molecules"],
            "companies": self.data["companies"],
            "distributors": self.data["distributors"]
        }
    
    def calculate_metrics(self, filtered_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate KPIs and aggregations"""
        imports = filtered_data["imports"]
        molecules = filtered_data["molecules"]
        companies = filtered_data["companies"]
        distributors = filtered_data["distributors"]
        
        # Basic KPIs
        total_imports = len(imports)
        total_quantity = sum(import_record["quantity"] for import_record in imports)
        
        # Active companies and distributors
        active_companies = len(set(import_record["company_id"] for import_record in imports))
        active_distributors = len(set(import_record["distributor_id"] for import_record in imports))
        
        # Top molecules by import count
        molecule_counts = {}
        for import_record in imports:
            molecule_id = import_record["molecule_id"]
            molecule_counts[molecule_id] = molecule_counts.get(molecule_id, 0) + 1
        
        top_molecules = []
        for molecule_id, count in sorted(molecule_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            molecule = next((m for m in molecules if m["id"] == molecule_id), None)
            if molecule:
                top_molecules.append({
                    "name": molecule["name"],
                    "count": count
                })
        
        # Top companies
        company_stats = {}
        for import_record in imports:
            company_id = import_record["company_id"]
            if company_id not in company_stats:
                company_stats[company_id] = {"count": 0, "quantity": 0}
            company_stats[company_id]["count"] += 1
            company_stats[company_id]["quantity"] += import_record["quantity"]
        
        top_companies = []
        for company_id, stats in sorted(company_stats.items(), key=lambda x: x[1]["count"], reverse=True)[:10]:
            company = next((c for c in companies if c["id"] == company_id), None)
            if company:
                top_companies.append({
                    "name": company["name"],
                    "count": stats["count"],
                    "total_quantity": stats["quantity"]
                })
        
        # Top distributors
        distributor_stats = {}
        for import_record in imports:
            distributor_id = import_record["distributor_id"]
            if distributor_id not in distributor_stats:
                distributor_stats[distributor_id] = {
                    "count": 0, 
                    "molecules": set(),
                    "countries": set()
                }
            distributor_stats[distributor_id]["count"] += 1
            distributor_stats[distributor_id]["molecules"].add(import_record["molecule_id"])
            distributor_stats[distributor_id]["countries"].add(import_record["country"])
        
        top_distributors = []
        for distributor_id, stats in sorted(distributor_stats.items(), key=lambda x: x[1]["count"], reverse=True)[:10]:
            distributor = next((d for d in distributors if d["id"] == distributor_id), None)
            if distributor:
                # Get top molecules and origins for tooltip
                top_mols = []
                for mol_id in list(stats["molecules"])[:3]:
                    molecule = next((m for m in molecules if m["id"] == mol_id), None)
                    if molecule:
                        top_mols.append(molecule["name"])
                
                top_distributors.append({
                    "name": distributor["name"],
                    "count": stats["count"],
                    "location": distributor.get("location", ""),
                    "top_molecules": ", ".join(top_mols),
                    "countries": ", ".join(list(stats["countries"])[:3])
                })
        
        # Chart data
        chart_data = {
            "molecules": top_molecules,
            "companies": top_companies,
            "distributors": top_distributors
        }
        
        return {
            "kpis": {
                "total_imports": total_imports,
                "total_quantity": total_quantity,
                "active_companies": active_companies,
                "active_distributors": active_distributors
            },
            "charts": chart_data,
            "tables": {
                "top_molecules": top_molecules,
                "top_companies": top_companies,
                "top_distributors": top_distributors
            }
        }
    
    def process_excel_data(self, file_stream, column_mapping: Dict[str, str]) -> Dict[str, Any]:
        """Process Excel file and return import results"""
        try:
            # Read Excel file
            df = pd.read_excel(file_stream, engine='openpyxl')
            
            # Validate required columns
            required_columns = ["Date", "Product Description", "Consignee Name", "Shipper Name", 
                              "Country of Origin", "QTY", "Unit", "Rate In FC", "Rate Currency"]
            
            missing_columns = []
            for col in required_columns:
                if col not in df.columns:
                    missing_columns.append(col)
            
            if missing_columns:
                return {
                    "error": f"Missing required columns: {', '.join(missing_columns)}",
                    "processed": 0,
                    "created": 0,
                    "skipped": 0
                }
            
            created_counts = {"molecules": 0, "companies": 0, "distributors": 0, "imports": 0}
            skipped_rows = []
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # Parse and validate row data
                    date_str = str(row["Date"]).strip()
                    try:
                        # Handle various date formats
                        if pd.isna(row["Date"]):
                            raise ValueError("Date is required")
                        
                        if isinstance(row["Date"], str):
                            date_obj = pd.to_datetime(date_str)
                        else:
                            date_obj = pd.to_datetime(row["Date"])
                        
                        date_str = date_obj.strftime("%Y-%m-%d")
                    except:
                        skipped_rows.append({
                            "row": index + 2,  # Excel rows start at 1, +1 for header
                            "reason": f"Invalid date format: {row['Date']}"
                        })
                        continue
                    
                    # Validate quantity
                    try:
                        quantity = float(row["QTY"])
                        if quantity <= 0:
                            raise ValueError("Quantity must be positive")
                    except:
                        skipped_rows.append({
                            "row": index + 2,
                            "reason": f"Invalid quantity: {row['QTY']}"
                        })
                        continue
                    
                    # Validate unit
                    unit = str(row["Unit"]).strip()
                    if not unit:
                        skipped_rows.append({
                            "row": index + 2,
                            "reason": "Unit is required"
                        })
                        continue
                    
                    # Validate unit price
                    try:
                        unit_price = float(row["Rate In FC"])
                        if unit_price < 0:
                            raise ValueError("Unit price cannot be negative")
                    except:
                        skipped_rows.append({
                            "row": index + 2,
                            "reason": f"Invalid unit price: {row['Rate In FC']}"
                        })
                        continue
                    
                    # Validate currency
                    currency = str(row["Rate Currency"]).strip().upper()
                    if currency not in ALLOWED_CURRENCIES:
                        skipped_rows.append({
                            "row": index + 2,
                            "reason": f"Invalid currency: {currency}"
                        })
                        continue
                    
                    # Get or create molecule
                    molecule_name = str(row["Product Description"]).strip()
                    if not molecule_name:
                        skipped_rows.append({
                            "row": index + 2,
                            "reason": "Product description is required"
                        })
                        continue
                    
                    molecule = self._find_or_create_entity(
                        "molecules", molecule_name, 
                        lambda name: {"id": self._generate_id(), "name": name},
                        created_counts, "molecules"
                    )
                    
                    # Get or create company
                    company_name = str(row["Consignee Name"]).strip()
                    if not company_name:
                        skipped_rows.append({
                            "row": index + 2,
                            "reason": "Consignee name is required"
                        })
                        continue
                    
                    company = self._find_or_create_entity(
                        "companies", company_name,
                        lambda name: {"id": self._generate_id(), "name": name},
                        created_counts, "companies"
                    )
                    
                    # Get or create distributor
                    distributor_name = str(row["Shipper Name"]).strip()
                    if not distributor_name:
                        skipped_rows.append({
                            "row": index + 2,
                            "reason": "Shipper name is required"
                        })
                        continue
                    
                    distributor = self._find_or_create_entity(
                        "distributors", distributor_name,
                        lambda name: {"id": self._generate_id(), "name": name},
                        created_counts, "distributors"
                    )
                    
                    # Create import record
                    import_record = {
                        "id": self._generate_id(),
                        "date": date_str,
                        "molecule_id": molecule["id"],
                        "company_id": company["id"],
                        "distributor_id": distributor["id"],
                        "country": str(row["Country of Origin"]).strip(),
                        "shipment_mode": str(row.get("Shipment Mode", "")).strip() if pd.notna(row.get("Shipment Mode")) else None,
                        "quantity": quantity,
                        "unit": unit,
                        "unit_price": unit_price,
                        "currency": currency,
                        "hs_code": str(row.get("HS Code", "")).strip() if pd.notna(row.get("HS Code")) else None
                    }
                    
                    self.data["imports"].append(import_record)
                    created_counts["imports"] += 1
                    
                except Exception as e:
                    skipped_rows.append({
                        "row": index + 2,
                        "reason": f"Processing error: {str(e)}"
                    })
                    continue
            
            # Save updated data
            if created_counts["imports"] > 0:
                self.save_data(self.data)
            
            return {
                "processed": len(df),
                "created": created_counts,
                "skipped": len(skipped_rows),
                "errors": skipped_rows[:10]  # Return top 10 errors
            }
            
        except Exception as e:
            logger.error(f"Error processing Excel file: {e}")
            return {
                "error": f"Error processing Excel file: {str(e)}",
                "processed": 0,
                "created": 0,
                "skipped": 0
            }
    
    def _find_or_create_entity(self, entity_type: str, name: str, 
                              create_func, created_counts: Dict[str, int], count_key: str):
        """Find existing entity by name or create new one"""
        # Normalize name for comparison
        normalized_name = name.lower().strip()
        
        # Look for existing entity
        for entity in self.data[entity_type]:
            if entity["name"].lower().strip() == normalized_name:
                return entity
        
        # Create new entity
        new_entity = create_func(name)
        self.data[entity_type].append(new_entity)
        created_counts[count_key] += 1
        return new_entity
    
    def _generate_id(self) -> str:
        """Generate unique ID"""
        import uuid
        return str(uuid.uuid4())
    
    def add_molecule(self, name: str, description: str = "") -> Tuple[bool, str]:
        """Add new molecule"""
        if not name or not name.strip():
            return False, "Name is required"
        
        if len(name) > 100:
            return False, "Name cannot exceed 100 characters"
        
        if len(description) > 500:
            return False, "Description cannot exceed 500 characters"
        
        # Check for duplicate names (case-insensitive)
        normalized_name = name.lower().strip()
        for molecule in self.data["molecules"]:
            if molecule["name"].lower().strip() == normalized_name:
                return False, "Molecule with this name already exists"
        
        molecule = Molecule(
            id=self._generate_id(),
            name=name.strip(),
            description=description.strip() if description else None
        )
        
        self.data["molecules"].append(asdict(molecule))
        self.save_data(self.data)
        return True, "Molecule added successfully"
    
    def add_company(self, name: str, location: str = "") -> Tuple[bool, str]:
        """Add new company"""
        if not name or not name.strip():
            return False, "Name is required"
        
        if len(name) > 100:
            return False, "Name cannot exceed 100 characters"
        
        if len(location) > 100:
            return False, "Location cannot exceed 100 characters"
        
        # Check for duplicate names (case-insensitive)
        normalized_name = name.lower().strip()
        for company in self.data["companies"]:
            if company["name"].lower().strip() == normalized_name:
                return False, "Company with this name already exists"
        
        company = Company(
            id=self._generate_id(),
            name=name.strip(),
            location=location.strip() if location else None
        )
        
        self.data["companies"].append(asdict(company))
        self.save_data(self.data)
        return True, "Company added successfully"
    
    def add_distributor(self, name: str, location: str = "") -> Tuple[bool, str]:
        """Add new distributor"""
        if not name or not name.strip():
            return False, "Name is required"
        
        if len(name) > 100:
            return False, "Name cannot exceed 100 characters"
        
        if len(location) > 100:
            return False, "Location cannot exceed 100 characters"
        
        # Check for duplicate names (case-insensitive)
        normalized_name = name.lower().strip()
        for distributor in self.data["distributors"]:
            if distributor["name"].lower().strip() == normalized_name:
                return False, "Distributor with this name already exists"
        
        distributor = Distributor(
            id=self._generate_id(),
            name=name.strip(),
            location=location.strip() if location else None
        )
        
        self.data["distributors"].append(asdict(distributor))
        self.save_data(self.data)
        return True, "Distributor added successfully"
    
    def add_import(self, import_data: Dict[str, Any]) -> Tuple[bool, str]:
        """Add new import record"""
        # Validate required fields
        required_fields = ["date", "molecule_id", "company_id", "distributor_id", 
                          "country", "quantity", "unit", "unit_price", "currency"]
        
        for field in required_fields:
            if field not in import_data or not import_data[field]:
                return False, f"Field '{field}' is required"
        
        # Validate date format
        try:
            datetime.strptime(import_data["date"], "%Y-%m-%d")
        except ValueError:
            return False, "Invalid date format. Use YYYY-MM-DD"
        
        # Validate quantity
        try:
            quantity = float(import_data["quantity"])
            if quantity <= 0:
                return False, "Quantity must be positive"
        except (ValueError, TypeError):
            return False, "Invalid quantity format"
        
        # Validate unit price
        try:
            unit_price = float(import_data["unit_price"])
            if unit_price < 0:
                return False, "Unit price cannot be negative"
        except (ValueError, TypeError):
            return False, "Invalid unit price format"
        
        # Validate currency
        if import_data["currency"].upper() not in ALLOWED_CURRENCIES:
            return False, f"Invalid currency. Allowed: {', '.join(ALLOWED_CURRENCIES)}"
        
        # Validate HS code if provided
        if import_data.get("hs_code"):
            import re
            if not re.match(r'^[0-9]{4,10}$', import_data["hs_code"]):
                return False, "HS code must be 4-10 digits"
        
        # Check if referenced entities exist
        molecule_exists = any(m["id"] == import_data["molecule_id"] for m in self.data["molecules"])
        company_exists = any(c["id"] == import_data["company_id"] for c in self.data["companies"])
        distributor_exists = any(d["id"] == import_data["distributor_id"] for d in self.data["distributors"])
        
        if not molecule_exists:
            return False, "Referenced molecule does not exist"
        if not company_exists:
            return False, "Referenced company does not exist"
        if not distributor_exists:
            return False, "Referenced distributor does not exist"
        
        # Create import record
        import_record = Import(
            id=self._generate_id(),
            date=import_data["date"],
            molecule_id=import_data["molecule_id"],
            company_id=import_data["company_id"],
            distributor_id=import_data["distributor_id"],
            country=import_data["country"],
            shipment_mode=import_data.get("shipment_mode"),
            quantity=quantity,
            unit=import_data["unit"],
            unit_price=unit_price,
            currency=import_data["currency"].upper(),
            hs_code=import_data.get("hs_code")
        )
        
        self.data["imports"].append(asdict(import_record))
        self.save_data(self.data)
        return True, "Import record added successfully"
    
    def bulk_delete_imports(self, import_ids: List[str]) -> Tuple[bool, str]:
        """Delete multiple import records"""
        if not import_ids:
            return False, "No import records selected"
        
        # Remove imports by ID
        original_count = len(self.data["imports"])
        self.data["imports"] = [imp for imp in self.data["imports"] if imp["id"] not in import_ids]
        deleted_count = original_count - len(self.data["imports"])
        
        if deleted_count > 0:
            self.save_data(self.data)
            return True, f"Successfully deleted {deleted_count} import records"
        else:
            return False, "No import records were deleted"
    
    def delete_molecule(self, molecule_id: str) -> Tuple[bool, str]:
        """Delete molecule if not referenced by imports"""
        # Check if molecule exists
        molecule = next((m for m in self.data["molecules"] if m["id"] == molecule_id), None)
        if not molecule:
            return False, "Molecule not found"
        
        # Check for references
        reference_count = sum(1 for imp in self.data["imports"] if imp["molecule_id"] == molecule_id)
        if reference_count > 0:
            return False, f"Cannot delete molecule. It is referenced by {reference_count} import records"
        
        # Delete molecule
        self.data["molecules"] = [m for m in self.data["molecules"] if m["id"] != molecule_id]
        self.save_data(self.data)
        return True, "Molecule deleted successfully"
    
    def delete_company(self, company_id: str) -> Tuple[bool, str]:
        """Delete company if not referenced by imports"""
        # Check if company exists
        company = next((c for c in self.data["companies"] if c["id"] == company_id), None)
        if not company:
            return False, "Company not found"
        
        # Check for references
        reference_count = sum(1 for imp in self.data["imports"] if imp["company_id"] == company_id)
        if reference_count > 0:
            return False, f"Cannot delete company. It is referenced by {reference_count} import records"
        
        # Delete company
        self.data["companies"] = [c for c in self.data["companies"] if c["id"] != company_id]
        self.save_data(self.data)
        return True, "Company deleted successfully"
    
    def delete_distributor(self, distributor_id: str) -> Tuple[bool, str]:
        """Delete distributor if not referenced by imports"""
        # Check if distributor exists
        distributor = next((d for d in self.data["distributors"] if d["id"] == distributor_id), None)
        if not distributor:
            return False, "Distributor not found"
        
        # Check for references
        reference_count = sum(1 for imp in self.data["imports"] if imp["distributor_id"] == distributor_id)
        if reference_count > 0:
            return False, f"Cannot delete distributor. It is referenced by {reference_count} import records"
        
        # Delete distributor
        self.data["distributors"] = [d for d in self.data["distributors"] if d["id"] != distributor_id]
        self.save_data(self.data)
        return True, "Distributor deleted successfully"

# Initialize Flask app
app = Flask(__name__)
app.secret_key = "import_goods_secret_key_2024"

# Initialize application
import_app = ImportGoodsApp()

# Routes
@app.route('/')
def dashboard():
    """Main dashboard page"""
    time_filter = request.args.get('time_filter', 'monthly')
    search_molecule = request.args.get('search_molecule', '').strip()[:100]
    search_country = request.args.get('search_country', '').strip()[:100]
    
    # Validate time filter
    allowed_filters = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    if time_filter not in allowed_filters:
        time_filter = 'monthly'
    
    # Get filtered data
    filtered_data = import_app.get_time_filtered_data(time_filter, search_molecule, search_country)
    
    # Calculate metrics
    metrics = import_app.calculate_metrics(filtered_data)
    
    return render_template('dashboard.html', 
                         metrics=metrics,
                         time_filter=time_filter,
                         search_molecule=search_molecule,
                         search_country=search_country,
                         allowed_currencies=ALLOWED_CURRENCIES,
                         common_units=COMMON_UNITS)

@app.route('/custom_date')
def custom_date():
    """Custom date range dashboard"""
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    search_molecule = request.args.get('search_molecule', '').strip()[:100]
    search_country = request.args.get('search_country', '').strip()[:100]
    
    metrics = None
    error = None
    
    if start_date and end_date:
        # Get custom date data
        result = import_app.get_custom_date_data(start_date, end_date, search_molecule, search_country)
        
        if "error" in result:
            error = result["error"]
        else:
            metrics = import_app.calculate_metrics(result)
    
    return render_template('custom_date.html',
                         metrics=metrics,
                         error=error,
                         start_date=start_date,
                         end_date=end_date,
                         search_molecule=search_molecule,
                         search_country=search_country,
                         allowed_currencies=ALLOWED_CURRENCIES,
                         common_units=COMMON_UNITS)

@app.route('/imports')
def imports():
    """Imports management page"""
    page = request.args.get('page', 1, type=int)
    per_page = 25
    
    # Get all imports sorted by date desc
    sorted_imports = sorted(import_app.data["imports"], 
                           key=lambda x: x["date"], reverse=True)
    
    # Pagination
    total = len(sorted_imports)
    start = (page - 1) * per_page
    end = start + per_page
    imports_page = sorted_imports[start:end]
    
    # Add entity names for display
    for import_record in imports_page:
        import_record["molecule_name"] = next(
            (m["name"] for m in import_app.data["molecules"] if m["id"] == import_record["molecule_id"]), 
            "Unknown"
        )
        import_record["company_name"] = next(
            (c["name"] for c in import_app.data["companies"] if c["id"] == import_record["company_id"]), 
            "Unknown"
        )
        import_record["distributor_name"] = next(
            (d["name"] for d in import_app.data["distributors"] if d["id"] == import_record["distributor_id"]), 
            "Unknown"
        )
    
    return render_template('imports.html',
                         imports=imports_page,
                         pagination={
                             'page': page,
                             'per_page': per_page,
                             'total': total,
                             'pages': (total + per_page - 1) // per_page
                         },
                         molecules=import_app.data["molecules"],
                         companies=import_app.data["companies"],
                         distributors=import_app.data["distributors"],
                         allowed_currencies=ALLOWED_CURRENCIES,
                         common_units=COMMON_UNITS)

@app.route('/molecules')
def molecules():
    """Molecules management page"""
    search = request.args.get('search', '').strip()[:100]
    
    molecules_list = import_app.data["molecules"]
    if search:
        molecules_list = [m for m in molecules_list if search.lower() in m["name"].lower()]
    
    return render_template('molecules.html', 
                         molecules=molecules_list,
                         search=search)

@app.route('/companies')
def companies():
    """Companies management page"""
    search = request.args.get('search', '').strip()[:100]
    
    companies_list = import_app.data["companies"]
    if search:
        companies_list = [c for c in companies_list if search.lower() in c["name"].lower()]
    
    return render_template('companies.html', 
                         companies=companies_list,
                         search=search)

@app.route('/distributors')
def distributors():
    """Distributors management page"""
    search = request.args.get('search', '').strip()[:100]
    
    distributors_list = import_app.data["distributors"]
    if search:
        distributors_list = [d for d in distributors_list if search.lower() in d["name"].lower()]
    
    return render_template('distributors.html', 
                         distributors=distributors_list,
                         search=search)

# API Routes
@app.route('/api/chart-data')
def api_chart_data():
    """API endpoint for chart data"""
    time_filter = request.args.get('time_filter', 'monthly')
    search_molecule = request.args.get('search_molecule', '').strip()[:100]
    search_country = request.args.get('search_country', '').strip()[:100]
    
    # Validate time filter
    allowed_filters = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    if time_filter not in allowed_filters:
        return jsonify({"error": "Invalid time filter"}), 400
    
    # Get filtered data and metrics
    filtered_data = import_app.get_time_filtered_data(time_filter, search_molecule, search_country)
    metrics = import_app.calculate_metrics(filtered_data)
    
    return jsonify(metrics)

@app.route('/api/custom-date-data')
def api_custom_date_data():
    """API endpoint for custom date data"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search_molecule = request.args.get('search_molecule', '').strip()[:100]
    search_country = request.args.get('search_country', '').strip()[:100]
    
    if not start_date or not end_date:
        return jsonify({"error": "Start date and end date are required"}), 400
    
    # Get custom date data
    result = import_app.get_custom_date_data(start_date, end_date, search_molecule, search_country)
    
    if "error" in result:
        return jsonify({"error": result["error"]}), 400
    
    metrics = import_app.calculate_metrics(result)
    return jsonify(metrics)

# CRUD Routes
@app.route('/add_molecule', methods=['POST'])
def add_molecule_route():
    """Add new molecule"""
    name = request.form.get('name', '').strip()
    description = request.form.get('description', '').strip()
    
    success, message = import_app.add_molecule(name, description)
    
    if success:
        flash(message, 'success')
    else:
        flash(message, 'error')
    
    return redirect(url_for('molecules'))

@app.route('/add_company', methods=['POST'])
def add_company_route():
    """Add new company"""
    name = request.form.get('name', '').strip()
    location = request.form.get('location', '').strip()
    
    success, message = import_app.add_company(name, location)
    
    if success:
        flash(message, 'success')
    else:
        flash(message, 'error')
    
    return redirect(url_for('companies'))

@app.route('/add_distributor', methods=['POST'])
def add_distributor_route():
    """Add new distributor"""
    name = request.form.get('name', '').strip()
    location = request.form.get('location', '').strip()
    
    success, message = import_app.add_distributor(name, location)
    
    if success:
        flash(message, 'success')
    else:
        flash(message, 'error')
    
    return redirect(url_for('distributors'))

@app.route('/add_import', methods=['POST'])
def add_import_route():
    """Add new import record"""
    import_data = {
        'date': request.form.get('date'),
        'molecule_id': request.form.get('molecule_id'),
        'company_id': request.form.get('company_id'),
        'distributor_id': request.form.get('distributor_id'),
        'country': request.form.get('country'),
        'shipment_mode': request.form.get('shipment_mode'),
        'quantity': request.form.get('quantity'),
        'unit': request.form.get('unit'),
        'unit_price': request.form.get('unit_price'),
        'currency': request.form.get('currency'),
        'hs_code': request.form.get('hs_code')
    }
    
    success, message = import_app.add_import(import_data)
    
    if success:
        flash(message, 'success')
    else:
        flash(message, 'error')
    
    return redirect(url_for('imports'))

@app.route('/bulk_delete_imports', methods=['POST'])
def bulk_delete_imports_route():
    """Bulk delete import records"""
    import_ids = request.form.getlist('import_ids')
    
    success, message = import_app.bulk_delete_imports(import_ids)
    
    if success:
        flash(message, 'success')
    else:
        flash(message, 'error')
    
    return redirect(url_for('imports'))

@app.route('/upload_excel', methods=['POST'])
def upload_excel_route():
    """Upload and process Excel file"""
    if 'file' not in request.files:
        flash('No file selected', 'error')
        return redirect(url_for('imports'))
    
    file = request.files['file']
    if file.filename == '':
        flash('No file selected', 'error')
        return redirect(url_for('imports'))
    
    if not file.filename.endswith('.xlsx'):
        flash('Only .xlsx files are allowed', 'error')
        return redirect(url_for('imports'))
    
    # Check file size (10MB limit)
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning
    
    if file_size > 10 * 1024 * 1024:  # 10MB
        flash('File size exceeds 10MB limit', 'error')
        return redirect(url_for('imports'))
    
    # Default column mapping
    column_mapping = {
        "Date": "date",
        "HS Code": "hs_code",
        "Product Description": "molecule",
        "Consignee Name": "company",
        "Shipper Name": "distributor",
        "Country of Origin": "country",
        "Shipment Mode": "shipment_mode",
        "QTY": "quantity",
        "Unit": "unit",
        "Rate In FC": "unit_price",
        "Rate Currency": "currency"
    }
    
    # Process Excel file
    result = import_app.process_excel_data(file, column_mapping)
    
    if "error" in result:
        flash(f"Upload failed: {result['error']}", 'error')
    else:
        message = f"Upload completed. Processed: {result['processed']}, Created: {result['created']['imports']}, Skipped: {result['skipped']}"
        flash(message, 'success')
        
        if result['errors']:
            error_details = "; ".join([f"Row {e['row']}: {e['reason']}" for e in result['errors'][:5]])
            flash(f"Errors: {error_details}", 'warning')
    
    return redirect(url_for('imports'))

@app.route('/delete_molecule/<molecule_id>', methods=['POST'])
def delete_molecule_route(molecule_id):
    """Delete molecule"""
    success, message = import_app.delete_molecule(molecule_id)
    
    if success:
        flash(message, 'success')
    else:
        flash(message, 'error')
    
    return redirect(url_for('molecules'))

@app.route('/delete_company/<company_id>', methods=['POST'])
def delete_company_route(company_id):
    """Delete company"""
    success, message = import_app.delete_company(company_id)
    
    if success:
        flash(message, 'success')
    else:
        flash(message, 'error')
    
    return redirect(url_for('companies'))

@app.route('/delete_distributor/<distributor_id>', methods=['POST'])
def delete_distributor_route(distributor_id):
    """Delete distributor"""
    success, message = import_app.delete_distributor(distributor_id)
    
    if success:
        flash(message, 'success')
    else:
        flash(message, 'error')
    
    return redirect(url_for('distributors'))

if __name__ == '__main__':
    # Validate and fix data on startup
    issues = import_app.validate_and_fix_data(import_app.data)
    if issues:
        logger.warning(f"Data validation issues found: {len(issues)}")
        for issue in issues[:10]:  # Log first 10 issues
            logger.warning(f"  {issue}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
