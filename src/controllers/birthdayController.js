const Birthday = require('../models/Birthday');

// @desc    Get all birthdays
// @route   GET /api/birthdays
// @access  Public
exports.getBirthdays = async (req, res) => {
    try {
        const birthdays = await Birthday.find();
        res.status(200).json(birthdays);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Add a new birthday
// @route   POST /api/birthdays
// @access  Public
exports.addBirthday = async (req, res) => {
    try {
        const { name, phone, birthDate, message } = req.body;
        const newBirthday = new Birthday({
            name,
            phone,
            birthDate,
            message
        });
        const savedBirthday = await newBirthday.save();
        res.status(201).json(savedBirthday);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update a birthday
// @route   PUT /api/birthdays/:id
// @access  Public
exports.updateBirthday = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBirthday = await Birthday.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBirthday) {
            return res.status(404).json({ message: 'Birthday not found' });
        }
        res.status(200).json(updatedBirthday);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Delete a birthday
// @route   DELETE /api/birthdays/:id
// @access  Public
exports.deleteBirthday = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBirthday = await Birthday.findByIdAndDelete(id);
        if (!deletedBirthday) {
            return res.status(404).json({ message: 'Birthday not found' });
        }
        res.status(200).json({ message: 'Birthday deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Export birthdays as CSV
// @route   GET /api/birthdays/export
// @access  Public
exports.exportBirthdaysCSV = async (req, res) => {
    try {
        const birthdays = await Birthday.find();
        
        // Create CSV header
        let csv = 'name,birthDate\n';
        
        // Add data rows
        birthdays.forEach(birthday => {
            const name = `"${birthday.name.replace(/"/g, '""')}"`;
            const birthDate = birthday.birthDate.toISOString().split('T')[0];
            csv += `${name},${birthDate}\n`;
        });
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=birthdays.csv');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Import birthdays from CSV
// @route   POST /api/birthdays/import
// @access  Public
exports.importBirthdaysCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const csvContent = req.file.buffer.toString('utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            return res.status(400).json({ message: 'CSV file is empty' });
        }
        
        // Parse header
        const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const nameIndex = header.indexOf('name');
        const birthDateIndex = header.indexOf('birthDate');
        
        // Validate required columns
        if (nameIndex === -1 || birthDateIndex === -1) {
            return res.status(400).json({ 
                message: 'CSV must contain "name" and "birthDate" columns' 
            });
        }
        
        const errors = [];
        const successfulImports = [];
        
        // Process data rows
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;
            
            // Simple CSV parsing (handles quoted values)
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let char of line) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim().replace(/^"|"$/g, ''));
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim().replace(/^"|"$/g, ''));
            
            const name = values[nameIndex];
            const birthDate = values[birthDateIndex];
            
            // Validate data
            if (!name || name.trim() === '') {
                errors.push(`Row ${i + 1}: Name is required`);
                continue;
            }
            
            const parsedDate = new Date(birthDate);
            if (isNaN(parsedDate.getTime())) {
                errors.push(`Row ${i + 1}: Invalid date format for "${birthDate}"`);
                continue;
            }
            
            try {
                // Create birthday with default phone value
                const newBirthday = new Birthday({
                    name: name.trim(),
                    phone: 'N/A',
                    birthDate: parsedDate
                });
                
                await newBirthday.save();
                successfulImports.push(name);
            } catch (err) {
                errors.push(`Row ${i + 1}: ${err.message}`);
            }
        }
        
        res.status(200).json({
            message: `Successfully imported ${successfulImports.length} birthdays`,
            imported: successfulImports.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

