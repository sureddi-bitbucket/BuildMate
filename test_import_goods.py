#!/usr/bin/env python3
"""
Comprehensive test suite for Import Goods Dashboard Application
Tests all major functionality including data models, business logic, and API endpoints
"""

import unittest
import json
import tempfile
import os
from datetime import datetime, timedelta
from import_goods_app import ImportGoodsApp, Molecule, Company, Distributor, Import, ALLOWED_CURRENCIES

class TestImportGoodsApp(unittest.TestCase):
    
    def setUp(self):
        """Set up test environment with temporary data file"""
        self.temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False)
        self.temp_file.close()
        self.app = ImportGoodsApp(self.temp_file.name)
        
        # Add some test data
        self.molecule1 = self.app.add_molecule("Test Molecule 1", "Test Description 1")[1]
        self.molecule2 = self.app.add_molecule("Test Molecule 2", "Test Description 2")[1]
        
        self.company1 = self.app.add_company("Test Company 1", "USA")[1]
        self.company2 = self.app.add_company("Test Company 2", "Germany")[1]
        
        self.distributor1 = self.app.add_distributor("Test Distributor 1", "USA")[1]
        self.distributor2 = self.app.add_distributor("Test Distributor 2", "UK")[1]
        
        # Add test imports
        today = datetime.now().strftime("%Y-%m-%d")
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        self.import1 = self.app.add_import({
            'date': today,
            'molecule_id': self.molecule1,
            'company_id': self.company1,
            'distributor_id': self.distributor1,
            'country': 'USA',
            'shipment_mode': 'Air',
            'quantity': 100.0,
            'unit': 'KG',
            'unit_price': 25.50,
            'currency': 'USD',
            'hs_code': '12345678'
        })[1]
        
        self.import2 = self.app.add_import({
            'date': yesterday,
            'molecule_id': self.molecule2,
            'company_id': self.company2,
            'distributor_id': self.distributor2,
            'country': 'Germany',
            'shipment_mode': 'Sea',
            'quantity': 500.0,
            'unit': 'TON',
            'unit_price': 1500.00,
            'currency': 'EUR',
            'hs_code': '87654321'
        })[1]
    
    def tearDown(self):
        """Clean up test environment"""
        if os.path.exists(self.temp_file.name):
            os.unlink(self.temp_file.name)
    
    def test_data_models(self):
        """Test data model structure and validation"""
        # Test Molecule model
        molecule = Molecule("test_id", "Test Name", "Test Description")
        self.assertEqual(molecule.id, "test_id")
        self.assertEqual(molecule.name, "Test Name")
        self.assertEqual(molecule.description, "Test Description")
        
        # Test Company model
        company = Company("test_id", "Test Company", "Test Location")
        self.assertEqual(company.id, "test_id")
        self.assertEqual(company.name, "Test Company")
        self.assertEqual(company.location, "Test Location")
        
        # Test Distributor model
        distributor = Distributor("test_id", "Test Distributor", "Test Location")
        self.assertEqual(distributor.id, "test_id")
        self.assertEqual(distributor.name, "Test Distributor")
        self.assertEqual(distributor.location, "Test Location")
        
        # Test Import model
        import_record = Import(
            "test_id", "2024-01-01", "molecule_id", "company_id", 
            "distributor_id", "USA", "Air", 100.0, "KG", 25.50, "USD", "12345678"
        )
        self.assertEqual(import_record.id, "test_id")
        self.assertEqual(import_record.date, "2024-01-01")
        self.assertEqual(import_record.quantity, 100.0)
        self.assertEqual(import_record.currency, "USD")
    
    def test_add_molecule(self):
        """Test adding molecules"""
        success, molecule_id = self.app.add_molecule("New Molecule", "New Description")
        self.assertTrue(success)
        self.assertIsNotNone(molecule_id)
        
        # Test duplicate name (case-insensitive)
        success, _ = self.app.add_molecule("new molecule", "Another Description")
        self.assertFalse(success)
        
        # Test empty name
        success, _ = self.app.add_molecule("", "Description")
        self.assertFalse(success)
        
        # Test name too long
        long_name = "A" * 101
        success, _ = self.app.add_molecule(long_name, "Description")
        self.assertFalse(success)
    
    def test_add_company(self):
        """Test adding companies"""
        success, company_id = self.app.add_company("New Company", "New Location")
        self.assertTrue(success)
        self.assertIsNotNone(company_id)
        
        # Test duplicate name (case-insensitive)
        success, _ = self.app.add_company("new company", "Another Location")
        self.assertFalse(success)
        
        # Test empty name
        success, _ = self.app.add_company("", "Location")
        self.assertFalse(success)
    
    def test_add_distributor(self):
        """Test adding distributors"""
        success, distributor_id = self.app.add_distributor("New Distributor", "New Location")
        self.assertTrue(success)
        self.assertIsNotNone(distributor_id)
        
        # Test duplicate name (case-insensitive)
        success, _ = self.app.add_distributor("new distributor", "Another Location")
        self.assertFalse(success)
        
        # Test empty name
        success, _ = self.app.add_distributor("", "Location")
        self.assertFalse(success)
    
    def test_add_import(self):
        """Test adding import records"""
        # Test valid import
        import_data = {
            'date': '2024-01-01',
            'molecule_id': self.molecule1,
            'company_id': self.company1,
            'distributor_id': self.distributor1,
            'country': 'Canada',
            'shipment_mode': 'Rail',
            'quantity': 200.0,
            'unit': 'L',
            'unit_price': 10.00,
            'currency': 'CAD',
            'hs_code': '11111111'
        }
        success, import_id = self.app.add_import(import_data)
        self.assertTrue(success)
        self.assertIsNotNone(import_id)
        
        # Test invalid date
        invalid_import = import_data.copy()
        invalid_import['date'] = 'invalid-date'
        success, _ = self.app.add_import(invalid_import)
        self.assertFalse(success)
        
        # Test invalid quantity
        invalid_import = import_data.copy()
        invalid_import['quantity'] = -100.0
        success, _ = self.app.add_import(invalid_import)
        self.assertFalse(success)
        
        # Test invalid currency
        invalid_import = import_data.copy()
        invalid_import['currency'] = 'INVALID'
        success, _ = self.app.add_import(invalid_import)
        self.assertFalse(success)
    
    def test_time_filtered_data(self):
        """Test time-based data filtering"""
        # Test daily filter
        daily_data = self.app.get_time_filtered_data("daily")
        self.assertIn('imports', daily_data)
        self.assertIn('molecules', daily_data)
        self.assertIn('companies', daily_data)
        self.assertIn('distributors', daily_data)
        
        # Test weekly filter
        weekly_data = self.app.get_time_filtered_data("weekly")
        self.assertIn('imports', weekly_data)
        
        # Test with search
        search_data = self.app.get_time_filtered_data("monthly", "Test Molecule 1", "USA")
        self.assertIn('imports', search_data)
    
    def test_custom_date_data(self):
        """Test custom date range data"""
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        end_date = datetime.now().strftime("%Y-%m-%d")
        
        custom_data = self.app.get_custom_date_data(start_date, end_date)
        self.assertIn('imports', custom_data)
        self.assertIn('molecules', custom_data)
        self.assertIn('companies', custom_data)
        self.assertIn('distributors', custom_data)
    
    def test_calculate_metrics(self):
        """Test metric calculations"""
        # Get some filtered data
        filtered_data = self.app.get_time_filtered_data("monthly")
        metrics = self.app.calculate_metrics(filtered_data)
        
        self.assertIn('total_imports', metrics)
        self.assertIn('total_quantity', metrics)
        self.assertIn('active_companies', metrics)
        self.assertIn('active_distributors', metrics)
        self.assertIn('top_molecules', metrics)
        self.assertIn('top_companies', metrics)
        self.assertIn('top_distributors', metrics)
        self.assertIn('chart_data', metrics)
    
    def test_delete_operations(self):
        """Test delete operations"""
        # Test delete molecule (should fail if referenced)
        success, message = self.app.delete_molecule(self.molecule1)
        self.assertFalse(success)  # Should fail because it's referenced by import1
        
        # Test delete company (should fail if referenced)
        success, message = self.app.delete_company(self.company1)
        self.assertFalse(success)  # Should fail because it's referenced by import1
        
        # Test delete distributor (should fail if referenced)
        success, message = self.app.delete_distributor(self.distributor1)
        self.assertFalse(success)  # Should fail because it's referenced by import1
        
        # Test bulk delete imports
        success, message = self.app.bulk_delete_imports([self.import1, self.import2])
        self.assertTrue(success)
        
        # Now should be able to delete entities
        success, _ = self.app.delete_molecule(self.molecule1)
        self.assertTrue(success)
        
        success, _ = self.app.delete_company(self.company1)
        self.assertTrue(success)
        
        success, _ = self.app.delete_distributor(self.distributor1)
        self.assertTrue(success)
    
    def test_data_persistence(self):
        """Test data loading and saving"""
        # Save current data
        success = self.app.save_data(self.app.data)
        self.assertTrue(success)
        
        # Create new app instance to test loading
        new_app = ImportGoodsApp(self.temp_file.name)
        
        # Verify data was loaded correctly
        self.assertEqual(len(new_app.data['molecules']), len(self.app.data['molecules']))
        self.assertEqual(len(new_app.data['companies']), len(self.app.data['companies']))
        self.assertEqual(len(new_app.data['distributors']), len(self.app.data['distributors']))
        self.assertEqual(len(new_app.data['imports']), len(self.app.data['imports']))
    
    def test_currency_validation(self):
        """Test currency validation"""
        # Test all allowed currencies
        for currency in ALLOWED_CURRENCIES:
            import_data = {
                'date': '2024-01-01',
                'molecule_id': self.molecule1,
                'company_id': self.company1,
                'distributor_id': self.distributor1,
                'country': 'Test',
                'quantity': 100.0,
                'unit': 'KG',
                'unit_price': 10.00,
                'currency': currency,
            }
            success, _ = self.app.add_import(import_data)
            self.assertTrue(success, f"Currency {currency} should be valid")
        
        # Test case-insensitive currency
        import_data = {
            'date': '2024-01-01',
            'molecule_id': self.molecule1,
            'company_id': self.company1,
            'distributor_id': self.distributor1,
            'country': 'Test',
            'quantity': 100.0,
            'unit': 'KG',
            'unit_price': 10.00,
            'currency': 'usd',  # lowercase
        }
        success, _ = self.app.add_import(import_data)
        self.assertTrue(success, "Currency should be case-insensitive")
    
    def test_validation_and_fix(self):
        """Test data validation and fixing"""
        # Test with valid data
        valid_data = {
            'molecules': [{'id': '1', 'name': 'Test'}],
            'companies': [{'id': '1', 'name': 'Test'}],
            'distributors': [{'id': '1', 'name': 'Test'}],
            'imports': []
        }
        issues = self.app.validate_and_fix_data(valid_data)
        self.assertEqual(len(issues), 0)
        
        # Test with missing required fields
        invalid_data = {
            'molecules': [{'id': '1'}],  # missing name
            'companies': [],
            'distributors': [],
            'imports': []
        }
        issues = self.app.validate_and_fix_data(invalid_data)
        self.assertGreater(len(issues), 0)

def run_tests():
    """Run all tests"""
    print("Running Import Goods Application Tests...")
    print("=" * 50)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestImportGoodsApp)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print("\nFailures:")
        for test, traceback in result.failures:
            print(f"  {test}: {traceback}")
    
    if result.errors:
        print("\nErrors:")
        for test, traceback in result.errors:
            print(f"  {test}: {traceback}")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_tests()
    exit(0 if success else 1)
