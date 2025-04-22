require('dotenv').config();

const express = require('express');
const cors = require('cors');
const {Pool} = require('pg');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');  

const nodemailer = require('nodemailer');

const app = express();

app.use(cors());
//app.use(express.urlencoded({ extended: true, limit: '50mb' }));
//app.use(express.json({limit: '50mb'}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.post('/test', (req, res) => {
    console.log('Request received');
    res.send('OK');
});

const pool = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT
})

pool.connect()
    .then(()=>console.log('Connected to PostgreSQL'))
    .catch(err=>console.log('Connection error', err.stack));



    
// Route to create a new visitor
app.post('/api/visitors', async (req, res) => {
    try {
        console.log('Received data: ', req.body);
        const { first_name, last_name, artist_name, email, phone, issueType, id_number, photo, redirectTo } = req.body;

        if (!first_name || !last_name || !artist_name || !email || !phone || !issueType || !redirectTo || !photo || !id_number) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const existingUser = await pool.query('SELECT * FROM visitors WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists!" });
        }

        const result = await pool.query(
            'INSERT INTO visitors (first_name, last_name, artist_name, email, id_number, phone, photo, "issueType", "redirectTo") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [first_name, last_name, artist_name, email, id_number, phone, photo, issueType, redirectTo]
        );

        // ✅ Get inserted visitor ID and generate confirmation link
        const visitorId = result.rows[0].id;
        const confirmationLink = `http://localhost:5000/api/confirm-visit/${visitorId}`;

        // ✅ Decide staff email based on redirectTo field
        let staffEmail = '';
        if (redirectTo.includes('Admin')) staffEmail = 'godblessodhiambo@gmail.com';
        else if (redirectTo.includes('Lilian')) staffEmail = 'lilian@example.com';
        else if (redirectTo.includes('Ann')) staffEmail = 'ann@example.com';
        else if (redirectTo.includes('Edwin')) staffEmail = 'edwin@example.com';

        // ✅ Setup Nodemailer transport
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your preferred SMTP provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: staffEmail,
            subject: `New Visitor: ${first_name} ${last_name}`,
            html: `
                <h3>New Visitor Details</h3>
                <p><strong>Name:</strong> ${first_name} ${last_name}</p>
                <p><strong>Artist Name:</strong> ${artist_name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>ID Number:</strong> ${id_number}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Purpose of Visit:</strong> ${issueType}</p>
                <p><strong>Redirected to:</strong> ${redirectTo}</p>
                <br/>
                <p><strong>Click below to view ticket:
                </strong></p>
                <a href="${confirmationLink}" style="
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                ">View Ticket</a>
            `
        };

        // ✅ Send the email
        await transporter.sendMail(mailOptions);
        console.log('Notification email sent to', staffEmail);

        return res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('Error creating visitor:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/confirm-visit/:id', async (req, res) => {
    const visitorId = req.params.id;

    try {
        const result = await pool.query(
            'UPDATE visitors SET served = TRUE WHERE id = $1 RETURNING *',
            [visitorId]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Visitor not found.');
        }

        res.send(`<h2>✅ Visitor marked as served successfully!</h2>
                  <p>Name: ${result.rows[0].first_name} ${result.rows[0].last_name}</p>`);
    } catch (error) {
        console.error('Error confirming visitor:', error);
        res.status(500).send('Error confirming visitor.');
    }
});

// GET /api/visitors
app.get('/api/visitors', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM visitors ORDER BY timestamp DESC');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
