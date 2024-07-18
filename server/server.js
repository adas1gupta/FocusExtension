const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://dasgupta1arjun:memeyourmaker1@fextensioncluster.gzwnxej.mongodb.net/?retryWrites=true&w=majority&appName=FExtensionCluster', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a schema for the analytics data
const analyticsSchema = new mongoose.Schema({
  installationId: String,
  sessionType: String,
  duration: Number,
  reminderInterval: Number,
  reminderVolume: Number,
  dayOfWeek: Number,
  hourOfDay: Number,
  timestamp: { type: Date, default: Date.now }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

app.post('/analytics', async (req, res) => {
  try {
    const analyticsData = new Analytics(req.body);
    await analyticsData.save();
    res.status(201).send('Analytics data saved successfully');
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});