# Import Goods Dashboard

A comprehensive web application for tracking and analyzing imported goods, providing fast, reliable visibility into imported molecules, volumes, companies, distributors, origins, and prices.

## 🎯 Business Goals

- **Fast Visibility**: Quick access to import data and insights
- **Time-based Analysis**: Support for daily, weekly, monthly, quarterly, yearly, and custom date ranges
- **Data Import**: Excel file upload with resilient validation and clear error feedback
- **Currency Support**: Maintain original currencies without implicit conversions
- **Future Ready**: API support planned for future data feeding

## 🏗️ Architecture

### Technology Stack
- **Backend**: Python Flask
- **Data Storage**: JSON file-based storage (easily extensible to databases)
- **Frontend**: HTML5, Bootstrap 5, Chart.js
- **Data Processing**: Pandas, OpenPyXL for Excel handling
- **Validation**: Comprehensive server-side and client-side validation

### Data Models

#### Molecule
- `id`: Unique identifier
- `name`: Molecule name (required, ≤100 chars, unique)
- `description`: Optional description (≤500 chars)

#### Company
- `id`: Unique identifier
- `name`: Company name (required, ≤100 chars, unique)
- `location`: Country/location (optional, ≤100 chars)

#### Distributor
- `id`: Unique identifier
- `name`: Distributor name (required, ≤100 chars, unique)
- `location`: Country/location (optional, ≤100 chars)

#### Import
- `id`: Unique identifier
- `date`: Import date (ISO YYYY-MM-DD, required)
- `molecule_id`: Reference to molecule (required)
- `company_id`: Reference to company (required)
- `distributor_id`: Reference to distributor (required)
- `country`: Country of origin (required)
- `shipment_mode`: Shipment method (optional)
- `quantity`: Import quantity (float > 0, required)
- `unit`: Unit of measurement (required)
- `unit_price`: Price per unit (float ≥ 0, required)
- `currency`: Currency code (required, from allowed set)
- `hs_code`: Harmonized System code (optional, 4-10 digits)

### Supported Currencies
- USD, EUR, INR, GBP, JPY, CNY (extensible)

### Common Units
- KG, TON, L, ML, PCS (others allowed with warning)

## 🚀 Features

### Dashboard (`/`)
- **Time Filters**: Daily, weekly, monthly, quarterly, yearly
- **Search**: Molecule and country search (case-insensitive)
- **KPIs**: Total imports, total quantity, active companies/distributors
- **Tables**: Top molecules, companies, and distributors
- **Charts**: Molecule trends and company distribution
- **Empty States**: Graceful handling of no data scenarios

### Custom Date Dashboard (`/custom_date`)
- **Date Range Picker**: Start and end date selection
- **Same Features**: KPIs, charts, and tables as main dashboard
- **Validation**: Date format and range validation (≤366 days)
- **Export**: Excel export functionality

### Imports Management (`/imports`)
- **List View**: Paginated import records with sorting
- **Add Import**: Modal form for new import records
- **Bulk Operations**: Checkbox selection and bulk deletion
- **Excel Upload**: 
  - Accepts .xlsx files up to 10 MB
  - Default column mapping
  - Automatic entity creation
  - Comprehensive error reporting
  - Upload summary with statistics

### Entity Management
- **Molecules** (`/molecules`): Catalog maintenance
- **Companies** (`/companies`): Company directory
- **Distributors** (`/distributors`): Distributor management

## 📁 File Structure

```
import_goods/
├── import_goods_app.py          # Main application
├── import_goods_requirements.txt # Python dependencies
├── run_import_goods.bat         # Windows startup script
├── test_import_goods.py         # Comprehensive test suite
├── create_sample_excel.py       # Sample data generator
├── README_IMPORT_GOODS.md       # This file
├── templates/                   # HTML templates
│   ├── base_import_goods.html   # Base template
│   ├── dashboard.html           # Main dashboard
│   ├── custom_date.html         # Custom date analysis
│   ├── imports.html             # Import management
│   ├── molecules.html           # Molecule catalog
│   ├── companies.html           # Company directory
│   └── distributors.html        # Distributor management
└── data/                        # Data storage (auto-created)
    └── import_goods_data.json   # Application data
```

## 🛠️ Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Quick Start
1. **Clone or download** the application files
2. **Install dependencies**:
   ```bash
   pip install -r import_goods_requirements.txt
   ```
3. **Run the application**:
   ```bash
   python import_goods_app.py
   ```
   Or on Windows:
   ```cmd
   run_import_goods.bat
   ```
4. **Open browser** and navigate to `http://localhost:5000`

### Dependencies
- **Flask 3.0.0**: Web framework
- **Pandas 2.1.4**: Data manipulation
- **OpenPyXL 3.1.2**: Excel file handling
- **Werkzeug 3.0.1**: WSGI utilities

## 📊 Usage Guide

### Getting Started
1. **First Launch**: The application will create an empty data structure
2. **Add Sample Data**: Use the sample Excel generator or manually add entities
3. **Import Data**: Upload Excel files through the Imports page
4. **View Analytics**: Use the Dashboard and Custom Date pages for insights

### Excel Import Format
The application expects Excel files with these columns:
- **Date**: Import date (YYYY-MM-DD format)
- **HS Code**: Harmonized System code
- **Product Description**: Molecule/product name
- **Consignee Name**: Company name
- **Shipper Name**: Distributor name
- **Country of Origin**: Origin country
- **Shipment Mode**: Transportation method
- **QTY**: Quantity
- **Unit**: Unit of measurement
- **Rate In FC**: Unit price
- **Rate Currency**: Currency code

### Data Validation
- **Required Fields**: Date, molecule, company, distributor, country, quantity, unit, price, currency
- **Data Types**: Proper validation for dates, numbers, and text
- **Business Rules**: Positive quantities, valid currencies, reasonable date ranges
- **Error Handling**: Clear feedback for validation failures

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV`: Set to `development` for debug mode
- `FLASK_DEBUG`: Enable/disable debug features

### Data File
- **Location**: `import_goods_data.json` (auto-created)
- **Format**: UTF-8 JSON
- **Backup**: Application creates atomic saves to prevent corruption

### Performance Settings
- **Upload Limit**: 10 MB maximum file size
- **Pagination**: 25 records per page (configurable)
- **Search Debouncing**: 300ms delay for search inputs

## 🧪 Testing

### Run Tests
```bash
python test_import_goods.py
```

### Test Coverage
- **Data Models**: Structure and validation
- **Business Logic**: CRUD operations and calculations
- **Data Persistence**: Loading and saving
- **Validation**: Field-level and business rule validation
- **Error Handling**: Graceful failure scenarios

### Sample Data
Generate test data with:
```bash
python create_sample_excel.py
```

## 🔍 API Endpoints

### Chart Data
- `GET /api/chart-data`: Dashboard chart data
- `GET /api/custom-date-data`: Custom date range data

### CRUD Operations
- `POST /add_molecule`: Add new molecule
- `POST /add_company`: Add new company
- `POST /add_distributor`: Add new distributor
- `POST /add_import`: Add new import record
- `POST /bulk_delete_imports`: Delete multiple imports
- `POST /upload_excel`: Upload Excel file

### Entity Management
- `GET /molecules`: List molecules
- `GET /companies`: List companies
- `GET /distributors`: List distributors
- `GET /imports`: List imports with pagination

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
- **Check Python version**: Ensure Python 3.8+ is installed
- **Verify dependencies**: Run `pip install -r import_goods_requirements.txt`
- **Check port**: Ensure port 5000 is available

#### Excel Upload Fails
- **File format**: Ensure .xlsx format (not .xls)
- **File size**: Check if file is under 10 MB
- **Column names**: Verify column headers match expected format
- **Data validation**: Check for invalid dates, negative quantities, etc.

#### No Data Displayed
- **Check data file**: Verify `import_goods_data.json` exists and has content
- **Time filters**: Ensure selected time range contains data
- **Search filters**: Clear search terms if no results

#### Performance Issues
- **Large datasets**: Consider pagination and search filters
- **Memory usage**: Monitor system resources during large imports
- **File I/O**: Check disk space and permissions

### Debug Mode
Enable debug mode by setting environment variables:
```bash
set FLASK_ENV=development
set FLASK_DEBUG=1
```

## 🔒 Security Considerations

### Data Validation
- **Input Sanitization**: All user inputs are validated and sanitized
- **File Upload**: Strict file type and size limits
- **SQL Injection**: Not applicable (JSON storage)
- **XSS Protection**: Template escaping prevents script injection

### Access Control
- **No Authentication**: Currently no user authentication (add as needed)
- **File Permissions**: Ensure data file has appropriate permissions
- **Network Security**: Consider firewall rules for production deployment

## 🚀 Deployment

### Development
- **Local Development**: Run directly with Python
- **Hot Reload**: Enable with `FLASK_DEBUG=1`
- **Data Persistence**: JSON file in local directory

### Production
- **Web Server**: Use Gunicorn or uWSGI with Flask
- **Reverse Proxy**: Nginx or Apache for static files
- **Database**: Consider migrating to PostgreSQL or MySQL for large datasets
- **Monitoring**: Add logging and health checks
- **Backup**: Implement regular data backup procedures

### Docker (Future Enhancement)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "import_goods_app.py"]
```

## 📈 Future Enhancements

### Planned Features
- **API Integration**: RESTful API for external data sources
- **Database Support**: PostgreSQL/MySQL integration
- **User Authentication**: Multi-user support with roles
- **Advanced Analytics**: Machine learning insights
- **Real-time Updates**: WebSocket support for live data
- **Mobile App**: React Native or Flutter mobile application

### Extensibility
- **Plugin System**: Modular architecture for custom features
- **Custom Reports**: Configurable report generation
- **Data Export**: Multiple export formats (CSV, PDF, etc.)
- **Integration**: ERP system connectors

## 📝 Version History

### v1.0.0 (Current)
- **Core Features**: Complete dashboard and management system
- **Excel Import**: Robust Excel file processing
- **Data Models**: Full CRUD operations for all entities
- **Charts & Analytics**: Interactive visualizations
- **Responsive UI**: Bootstrap 5 interface

## 🤝 Contributing

### Development Setup
1. **Fork** the repository
2. **Create** feature branch
3. **Implement** changes with tests
4. **Submit** pull request

### Code Standards
- **Python**: PEP 8 compliance
- **HTML**: Semantic markup and accessibility
- **JavaScript**: ES6+ with error handling
- **Testing**: Unit tests for all new features

## 📄 License

This project is provided as-is for educational and business use. Modify and distribute according to your needs.

## 📞 Support

### Documentation
- **README**: This comprehensive guide
- **Code Comments**: Inline documentation
- **Test Examples**: Working usage examples

### Getting Help
- **Code Review**: Check test files for usage patterns
- **Debug Mode**: Enable Flask debug for detailed error messages
- **Logs**: Check console output for application logs

---

**Import Goods Dashboard** - Making import data management simple and insightful.
