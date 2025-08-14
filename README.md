# Molecule Import Dashboard

A comprehensive web application for tracking and analyzing molecule imports, company data, and distributor information with time-based analytics and visualizations.

## Features

### 🎯 **Dashboard Analytics**
- **Time-based Views**: Daily, Weekly, Monthly, and Yearly data filtering
- **Key Metrics**: Total imports, total value, active companies, distributors
- **Interactive Charts**: Bar charts for molecule trends, doughnut charts for company distribution

### 📊 **Comprehensive Metrics**
- **Top Molecules**: Most imported molecules by count and category
- **Company Analysis**: Top molecules by company, company performance overview
- **Distributor Insights**: Top distributors by import count and value, ratings
- **Price Analysis**: Average, minimum, maximum prices, total import value

### 🏢 **Data Management**
- **Molecules**: Add/edit molecules with categories and molecular weights
- **Companies**: Manage company information, types, and locations
- **Distributors**: Track distributor details and ratings
- **Import Records**: Complete import tracking with status management

### 📈 **Visualizations**
- **Charts**: Interactive charts using Chart.js
- **Tables**: Responsive data tables with sorting and filtering
- **Cards**: Summary cards with key performance indicators
- **Responsive Design**: Mobile-friendly Bootstrap-based interface

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Setup Steps

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python molecule_dashboard.py
   ```

4. **Access the application**
   - Open your web browser
   - Navigate to: `http://localhost:5001`

## Usage

### Dashboard Navigation
- **Dashboard**: Main analytics view with time filters
- **Molecules**: Manage molecule catalog
- **Companies**: Company registration and management
- **Distributors**: Distributor information and ratings
- **Import Records**: Track all import transactions

### Time-based Analysis
- **Daily**: Last 24 hours of data
- **Weekly**: Last 7 days of data
- **Monthly**: Last 30 days of data
- **Yearly**: Last 365 days of data

### Adding Data
1. **Molecules**: Click "Add New Molecule" and fill in name, category, and molecular weight
2. **Companies**: Add company details including name, type, and location
3. **Distributors**: Register distributors with ratings and locations
4. **Imports**: Create import records linking companies, molecules, and distributors

## Data Structure

### Sample Data Included
The application comes with sample data including:
- **8 Common Molecules**: Paracetamol, Ibuprofen, Aspirin, Omeprazole, Metformin, Amlodipine, Lisinopril, Atorvastatin
- **5 Sample Companies**: PharmaCorp Ltd, MediTech Solutions, HealthCare Plus, BioPharma Inc, Life Sciences Co
- **5 Sample Distributors**: Global Pharma Supply, MediDistributors, BioSupply Chain, Pharma Logistics, Health Supply Co
- **500 Sample Import Records**: Generated over the last 2 years with realistic pricing

### Data Categories
- **Molecule Categories**: Analgesic, NSAID, Salicylate, PPI, Antidiabetic, Calcium Channel Blocker, ACE Inhibitor, Statin
- **Company Types**: Pharmaceutical, Biotechnology, Healthcare, Research, Manufacturing, Distribution
- **Import Statuses**: Pending, In Transit, Delivered, Completed

## Technical Details

### Architecture
- **Backend**: Flask web framework
- **Frontend**: Bootstrap 5, Chart.js, Font Awesome
- **Data Storage**: JSON file-based storage (easily extensible to database)
- **Charts**: Interactive charts using Chart.js library

### File Structure
```
├── molecule_dashboard.py      # Main Flask application
├── requirements.txt           # Python dependencies
├── templates/                 # HTML templates
│   ├── base_molecule.html    # Base template with navigation
│   ├── dashboard.html        # Main dashboard view
│   ├── molecules.html        # Molecules management
│   ├── companies.html        # Companies management
│   ├── distributors.html     # Distributors management
│   └── imports.html          # Import records management
└── molecule_data.json        # Data storage (auto-generated)
```

### API Endpoints
- `/` - Main dashboard
- `/molecules` - Molecules management
- `/companies` - Companies management
- `/distributors` - Distributors management
- `/imports` - Import records management
- `/api/chart-data` - Chart data API endpoint

## Customization

### Adding New Molecule Categories
Edit the `molecules.html` template and add new options to the category select dropdown.

### Adding New Company Types
Edit the `companies.html` template and add new options to the company type select dropdown.

### Modifying Charts
The dashboard uses Chart.js. Modify the JavaScript code in `dashboard.html` to customize chart appearance and behavior.

### Data Import/Export
The application uses JSON files for data storage. You can:
- Manually edit `molecule_data.json` for bulk data changes
- Export data to CSV/Excel by modifying the Flask routes
- Integrate with external databases by modifying the data loading functions

## Troubleshooting

### Common Issues
1. **Port already in use**: Change the port in `molecule_dashboard.py` (line 320)
2. **Template errors**: Ensure all template files are in the `templates/` directory
3. **Data not loading**: Check that `molecule_data.json` exists and is readable

### Performance
- For large datasets (>1000 records), consider implementing pagination
- Chart rendering can be optimized by limiting data points
- Database integration recommended for production use

## Future Enhancements

### Planned Features
- **Advanced Filtering**: Date ranges, price ranges, status filters
- **Export Functionality**: PDF reports, Excel exports
- **User Authentication**: Login system with role-based access
- **Real-time Updates**: WebSocket integration for live data
- **Mobile App**: React Native or Flutter mobile application

### Integration Possibilities
- **ERP Systems**: SAP, Oracle, Microsoft Dynamics
- **Accounting Software**: QuickBooks, Xero, Tally
- **Supply Chain Platforms**: SAP Ariba, Coupa
- **Analytics Tools**: Power BI, Tableau integration

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the code comments for implementation details
3. Ensure all dependencies are correctly installed
4. Verify file permissions and paths

## License

This project is provided as-is for educational and business use. Feel free to modify and extend according to your needs.

---

**Built with ❤️ using Flask, Bootstrap, and Chart.js** 