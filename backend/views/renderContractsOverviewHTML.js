function renderContractsOverviewHTML(contracts) {
    console.log("Rendering contracts:", contracts);
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Contracts Overview</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          padding: 2rem;
          background-color: #f9f9f9;
          color: #333;
        }
  
        h1 {
          text-align: center;
          margin-bottom: 2rem;
          color: #2c3e50;
        }
  
        .contract {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
  
        .contract:hover {
          transform: scale(1.01);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
  
        .contract h2 {
          margin-top: 0;
          color: #34495e;
        }
  
        .status {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          background-color: #eee;
          color: #555;
        }
  
        .status::before {
          content: "●";
          display: inline-block;
          margin-right: 0.4rem;
          font-size: 0.8rem;
        }
  
        .status:contains("Active") {
          background-color: #e6f4ea;
          color: #2e7d32;
        }
  
        .status:contains("Inactive") {
          background-color: #fdecea;
          color: #c62828;
        }
  
        ul {
          padding-left: 1.2rem;
          list-style-type: none;
        }
  
        li {
          padding: 0.3rem 0;
        }
  
        li::before {
          content: "• ";
          color: #3498db;
          margin-right: 0.3rem;
        }
      </style>
    </head>
    <body>
      <h1>Contracts Overview</h1>
      ${contracts.map(contract => `
        <div class="contract">
          <h2>${contract.full_name}</h2>
          <p><strong>Email:</strong> ${contract.email}</p>
          <p><strong>Status:</strong> <span class="status">${contract.contract_status}</span></p>
          <ul>
            ${contract.steps.map(step => `
              <li>${step.step_name}: ${step.completed ? '✅ Completed' : '❌ Incomplete'}</li>
            `).join('')}
          </ul>
        </div>
      `).join('')}
    </body>
    </html>
    `;
  }
  
  module.exports = renderContractsOverviewHTML;
  