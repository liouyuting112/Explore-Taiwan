const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.static('public'));

// Weather Proxy API
// Uses wttr.in (free, no key required)
app.get('/api/weather', async (req, res) => {
    const city = req.query.city || 'Taipei';
    try {
        const response = await fetch(`https://wttr.in/${city}?format=j1`);
        if (!response.ok) throw new Error('Weather service unavailable');
        const data = await response.json();
        
        const current = data.current_condition[0];
        res.json({
            city: city,
            temp: current.temp_C,
            condition: current.lang_zh ? current.lang_zh[0].value : current.weatherDesc[0].value,
            humidity: current.humidity,
            wind: current.windspeedKmph,
            time: new Date().toISOString()
        });
    } catch (error) {
        console.error('Weather fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Taiwan Travel Tool backend running at http://localhost:${PORT}`);
});
