require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log('MONGODB_URI:', process.env.MONGODB_URI);
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*',  // Be more specific in production
  methods: ['POST']
}));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Updated schema
const analyticsSchema = new mongoose.Schema({
  installationId: String,
  sessionType: String,
  duration: Number,
  durationReadable: String,
  reminderInterval: Number,
  reminderIntervalReadable: String,
  reminderVolume: Number,
  reminderVolumeReadable: String,
  dayOfWeek: { type: Number, min: 0, max: 6 },
  dayOfWeekName: String,
  hourOfDay: { type: Number, min: 0, max: 23 },
  hourOfDayReadable: String,
  timeOfDayStarted: { type: Date, default: Date.now },
  timeOfDayStartedReadable: String,
  pauseFrequency: { type: Number, default: 0 },
  reminderSoundCount: { type: Number, default: 0 },
  dailyStudySessions: { type: Number, default: 0 },
  completionRate: { type: Number, min: 0, max: 1 },
  completionRateReadable: String,
  timestamp: { type: Date, default: Date.now }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

function validateAnalyticsData(data) {
  const errors = [];
  if (!data.sessionType) errors.push('Session type is required');
  if (typeof data.duration !== 'number') errors.push('Duration must be a number');
  if (typeof data.reminderInterval !== 'number') errors.push('Reminder interval must be a number');
  if (typeof data.reminderVolume !== 'number') errors.push('Reminder volume must be a number');
  if (!Number.isInteger(data.dayOfWeek) || data.dayOfWeek < 0 || data.dayOfWeek > 6) errors.push('Day of week must be an integer between 0 and 6');
  if (!Number.isInteger(data.hourOfDay) || data.hourOfDay < 0 || data.hourOfDay > 23) errors.push('Hour of day must be an integer between 0 and 23');
  if (!data.timeOfDayStarted) errors.push('Time of day started is required');
  if (typeof data.completionRate !== 'number' || data.completionRate < 0 || data.completionRate > 1) errors.push('Completion rate must be a number between 0 and 1');
  return errors;
}

app.post('/analytics', async (req, res) => {
  console.log('Received analytics data:', req.body);

  const validationErrors = validateAnalyticsData(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const formattedData = formatAnalyticsData(req.body);
    console.log('Formatted analytics data:', formattedData);
    const analyticsData = new Analytics(formattedData);
    await analyticsData.save();
    console.log('Analytics data saved successfully');
    res.status(201).json({ message: 'Analytics data saved successfully' });
  } catch (error) {
    console.error('Error saving analytics data:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

function formatAnalyticsData(data) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Parse the timeOfDayStarted correctly
  let date;
  if (data.timeOfDayStarted) {
    const [time, timezone] = data.timeOfDayStarted.split(' (');
    const [hours, minutes, seconds] = time.split(':');
    date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(parseInt(seconds, 10));
  } else {
    date = new Date();
  }

  return {
    ...data,
    duration: data.duration,
    durationReadable: `${(data.duration / 60).toFixed(2)} minutes`,
    dayOfWeek: data.dayOfWeek,
    dayOfWeekName: daysOfWeek[data.dayOfWeek],
    hourOfDay: date.getHours(),
    hourOfDayReadable: date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
    timeOfDayStarted: date,
    timeOfDayStartedReadable: date.toLocaleString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      timeZoneName: 'short'
    }),
    reminderInterval: data.reminderInterval,
    reminderIntervalReadable: `${data.reminderInterval} seconds`,
    reminderVolume: data.reminderVolume,
    reminderVolumeReadable: `${(data.reminderVolume * 100).toFixed(0)}%`,
    completionRate: data.completionRate,
    completionRateReadable: `${(data.completionRate * 100).toFixed(2)}%`
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});