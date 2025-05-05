const pool = require('../config/db');
const transporter = require('../utils/mailer');

const initializeAgreementSteps = async (visitorId) => {
  const steps = ['id_input', 'contract_signed', 'songs_submitted', 'artwork_submitted'];
  for (const step of steps) {
    await pool.query(
      'INSERT INTO agreement_steps (visitor_id, step_name, completed) VALUES ($1, $2, $3)',
      [visitorId, step, false]
    );
  }
};

const createVisitor = async (req, res) => {
  try {
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

    const visitorId = result.rows[0].id;
    //await initializeAgreementSteps(visitorId);
    //const confirmationLink = `http://localhost:5000/api/view-issue-type/${encodeURIComponent(issueType)}`;
    const confirmationLink = `http://localhost:5000/api/visitors/view-issue-type/${encodeURIComponent(issueType)}`;


    let staffEmail = '';
    if (redirectTo.includes('Admin')) staffEmail = 'godblessodhiambo@gmail.com';
    else if (redirectTo.includes('Lilian')) staffEmail = 'lilian@example.com';
    else if (redirectTo.includes('Ann')) staffEmail = 'ann@example.com';
    else if (redirectTo.includes('Edwin')) staffEmail = 'edwin@example.com';
    if (issueType === 'Contract Agreement') {
      await initializeAgreementSteps(visitorId);
    }
    
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
        <p><strong>Click below to view ticket:</strong></p>
        <a href="${confirmationLink}">View Ticket</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating visitor:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllVisitors = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitors ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const confirmVisit = async (req, res) => {
  const visitorId = req.params.id;

  try {
    const checkResult = await pool.query('SELECT * FROM visitors WHERE id = $1', [visitorId]);

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Visitor not found.' });
    }

    if (checkResult.rows[0].served) {
      return res.status(400).json({ error: 'Visitor has already been marked as served.' });
    }

    const result = await pool.query(
      'UPDATE visitors SET served = TRUE WHERE id = $1 RETURNING *',
      [visitorId]
    );

    res.status(200).json({
      message: 'Visitor marked as served successfully!',
      visitor: result.rows[0],
    });

  } catch (error) {
    console.error('Error confirming visitor:', error);
    res.status(500).json({ error: 'Error confirming visitor.', details: error.message });
  }
};


const getVisitorsByIssueType = async (req, res) => {
  const issueType = decodeURIComponent(req.params.issueType);

  try {
    const result = await pool.query(
      'SELECT * FROM visitors WHERE "issueType" = $1 ORDER BY timestamp DESC',
      [issueType]
    );

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Visitor Tickets</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f8f9fa;
          padding: 40px;
          color: #333;
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background-color: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #eaeaea;
        }
        th {
          background-color: #f0f2f5;
          font-weight: 600;
        }
        tr:hover {
          background-color: #f9f9f9;
        }
        button {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
        button:hover {
          background-color: #218838;
        }
        .status {
          font-weight: bold;
        }
        .served {
          color: green;
        }
        .not-served {
          color: red;
        }
        form {
          margin: 0;
        }
      </style>
    </head>
    <body>
    
    <h2>Visitors with Issue Type: ${issueType}</h2>
    <table>
      <tr>
        <th>Name</th>
        <th>Issue Type</th>
        <th>Email</th>
        <th>Status</th>
        <th>Served</th>
        <th>Action</th>
      </tr>
    `;

    result.rows.forEach(visitor => {
      html += `
        <tr>
          <td>${visitor.first_name} ${visitor.last_name}</td>
          <td>${visitor.issueType}</td>
          <td>${visitor.email}</td>
          <td>
            <strong>Status:</strong> ${visitor.contract_status}
          </td>
          
          ${visitor.issueType === 'Contract Agreement' ? `
            <td>
              <form action="/start-contract/${visitor.id}" method="GET">
                <button type="submit">Start Contract</button>
              </form>
            </td>
          ` : '<td></td>'}          

          <td class="status ${visitor.served ? 'served' : 'not-served'}">
            ${visitor.served ? '✅ Served' : '❌ Not served'}
          </td>
          <td>
            ${
              visitor.served
                ? 'Already served'
                : `
                  <form id="confirm-form-${visitor.id}">
                    <button type="button" onclick="confirmVisit(${visitor.id})">Mark as Served</button>
                  </form>
                `
            }
          </td>
        </tr>
      `;
    });

    html += `
      </table>

      <script>
        async function confirmVisit(visitorId) {
          try {
            const response = await fetch('/api/visitors/confirm-visit/' + visitorId, {
              method: 'PATCH'
            });

            if (response.ok) {
              alert('Visitor marked as served!');
              location.reload();
            } else {
              const errorData = await response.json();
              alert('Error: ' + errorData.error);
            }
          } catch (error) {
            alert('Request failed. Check your connection or try again.');
            console.error('Error:', error);
          }
        }
      </script>

      </body>
      </html>
      `;

      res.send(html);


  } catch (error) {
    console.error('Error fetching visitors by issue type:', error);
    res.status(500).send('Error fetching visitors.');
  }
};


const deleteVisitor = async (req, res) => {
  const visitorId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM visitors WHERE id = $1 RETURNING *',
      [visitorId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Visitor not found.' });
    }

    res.status(200).json({ message: 'Visitor deleted successfully.' });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  createVisitor,
  getAllVisitors,
  confirmVisit,
  getVisitorsByIssueType,
  deleteVisitor,
};
