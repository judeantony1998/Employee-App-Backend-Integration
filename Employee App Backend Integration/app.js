// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;

// Use bodyParser middleware to parse JSON data from requests
app.use(bodyParser.json());

// Use CORS middleware for cross-origin requests (needed for frontend-backend communication)
app.use(cors());

// MongoDB Atlas connection URI (replace with your own MongoDB URI)
const mongoURI = 'your_mongo_connection_string_here'; // <-- Replace this with your MongoDB Atlas connection string

// Connect to MongoDB using mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Create a Schema for Employee
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  salary: { type: Number, required: true },
  department: { type: String, required: true }
});

// Create a Model from the Schema
const Employee = mongoose.model('Employee', employeeSchema);

// ------------------------------ API Routes ------------------------------

// GET all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving employees', error: error.message });
  }
});

// GET a single employee by ID
app.get('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving employee', error: error.message });
  }
});

// POST new employee
app.post('/api/employees', async (req, res) => {
  const { name, position, salary, department } = req.body;

  // Basic validation
  if (!name || !position || !salary || !department) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newEmployee = new Employee({
      name,
      position,
      salary,
      department
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Error adding employee', error: error.message });
  }
});

// PUT (update) an employee by ID
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { name, position, salary, department } = req.body;

  // Validate if all fields are provided
  if (!name || !position || !salary || !department) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(id, { name, position, salary, department }, { new: true });

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee', error: error.message });
  }
});

// DELETE an employee by ID
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
});

// ------------------------------ Start Server ------------------------------
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
