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
                line-height: 1.6;
            }

            h1 {
                text-align: center;
                margin-bottom: 2rem;
                color: #2c3e50;
                border-bottom: 2px solid #ecf0f1;
                padding-bottom: 1rem;
            }

            .contract {
                background: #fff;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                padding: 1.5rem;
                margin-bottom: 2rem;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .contract:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
            }

            .contract h2 {
                margin-top: 0;
                color: #34495e;
                margin-bottom: 1rem;
                border-bottom: 1px solid #ddd;
                padding-bottom: 0.5rem;
            }

            .contract p {
                margin-bottom: 0.75rem;
            }

            .status {
                display: inline-block;
                padding: 0.4rem 0.75rem;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                color: #fff;
            }

            .status.served {
                background-color: #2ecc71; /* Emerald Green */
            }

            .status.not-served {
                background-color: #e74c3c; /* Alizarin Crimson */
            }

            ul {
                padding-left: 1.5rem;
                list-style-type: square;
            }

            li {
                padding: 0.4rem 0;
                border-bottom: 1px dashed #ecf0f1;
            }

            li:last-child {
                border-bottom: none;
            }

            /* Table Styles */
            table {
                width: 100%;
                margin-top: 1rem;
                border-collapse: collapse;
            }

            th, td {
                padding: 0.8rem;
                text-align: left;
                border-bottom: 1px solid #ecf0f1;
            }

            th {
                background-color: #f2f2f2;
                font-weight: 600;
            }

            /* Button Styles */
            button {
                background-color: #3498db; /* Belize Hole */
                color: white;
                padding: 0.75rem 1.25rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            button:hover {
                background-color: #2980b9; /* Peter River */
            }
        </style>
        <script>
            function confirmVisit(visitorId) {
                console.log("Mark as Served clicked for visitor ID: " + visitorId);
                fetch('/api/markAsServed/' + visitorId, { method: 'POST' })
                    .then(response => {
                        if (response.ok) {
                            alert('Visitor marked as served!');
                            // You might want to refresh the page or update the UI here
                            window.location.reload(); // Simple reload
                        } else {
                            alert('Failed to mark visitor as served.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while marking visitor as served.');
                    });
            }
        </script>
    </head>
    <body>
        <h1>Contracts Overview</h1>
        ${contracts.map(visitor => {
            const visitorId = visitor?.id ?? null; 
            return `
                <div class="contract">
                    <h2>${visitor.full_name}</h2>
                    <p><strong>Email:</strong> ${visitor.email}</p>
                    <p><strong>Status:</strong> <span class="status ${visitor.served ? 'served' : 'not-served'}">${visitor.served ? 'Served' : 'Not Served'}</span></p>
                    <ul>
                        ${visitor.steps.map(step => `
                            <li>${step.step_name}: ${step.completed ? '✅ Completed' : '❌ Incomplete'}</li>
                        `).join('')}
                    </ul>
                    <table>
                        <tr>
                            <th>Served Status</th>
                            <th>Action</th>
                        </tr>
                        <tr>
                            <td class="status-cell">
                                ${visitor.served ? '✅ Served' : '❌ Not served'}
                            </td>
                            <td>
                                ${!visitor.served ? `
                                    <form id="confirm-form-${visitorId}">
                                        <button type="button" onclick="confirmVisit(${visitorId})">Mark as Served</button>
                                    </form>` : '✅ Already served'
                                }
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        }).join('')}
    </body>
    </html>
    `;
}
module.exports = renderContractsOverviewHTML;