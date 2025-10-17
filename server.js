const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PRIMARY_KEY = process.env.MTN_PRIMARY_KEY || '51330c2b5c7547a5a1dcbd1a3b989c1c';
const SECONDARY_KEY = process.env.MTN_SECONDARY_KEY || '9018e5829563452793f2fd0022bb5c15';
const ENVIRONMENT = 'sandbox';
const BASE_URL = `https://${ENVIRONMENT}.momodeveloper.mtn.com`;

const transactions = {};

app.get('/', (req, res) => {
    res.json({ status: 'MTN Payment API Running' });
});

app.post('/api/payment/initiate', async (req, res) => {
    const { amount, phoneNumber, reference, customerName } = req.body;
    
    try {
        const referenceId = uuidv4();
        
        console.log('Payment initiated:', { amount, phoneNumber, reference });
        
        // Store transaction
        transactions[reference] = { 
            referenceId, 
            status: 'PENDING',
            amount,
            phoneNumber,
            customerName,
            timestamp: new Date()
        };
        
        // In production, make actual MTN MoMo API call here
        
        res.json({ success: true, referenceId });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/payment/status', async (req, res) => {
    const { reference } = req.body;
    const transaction = transactions[reference];
    
    if (!transaction) {
        return res.json({ completed: false });
    }
    
    try {
        // Simulate payment completion after 10 seconds
        const elapsed = Date.now() - transaction.timestamp.getTime();
        
        if (elapsed > 10000) {
            const success = Math.random() > 0.2; // 80% success rate
            res.json({ 
                completed: true, 
                success: success,
                transactionId: transaction.referenceId,
                message: success ? 'Payment successful' : 'Payment failed'
            });
        } else {
            res.json({ completed: false });
        }
    } catch (error) {
        res.json({ completed: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Payment API running on port ${PORT}`);
});
