const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

app.use(express.static(path.join('')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}/`);
});

// users
app.get('/users', (req, res) => {
    const query = 'SELECT * FROM users;';

    pool.query(query, (error, result) => {
        if (error) {
            console.error('Error occurred:', error);
            res.status(500).send('An error occurred while retrieving data from the database.');
        } else {
            const students = result.rows;
            res.json(students);
        }
    });
});

app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            console.error('Error fetching user:', error);
            res.status(500).send('Failed to retrieve user');
        } else {
            res.json(results.rows[0]);
        }
    });
});

app.post('/users', (req, res) => {
    const { id, fio, email, password, vklink, admin } = req.body;

    const query = 'INSERT INTO users (id, fio, email, password, vklink, admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';
    const values = [id, fio, email, password, vklink, admin];

    pool.query(query, values, (error, result) => {
        if (error) {
            console.error('Error occurred:', error);
            res.status(500).send('An error occurred while creating a new user.');
        } else {
            const newUser = result.rows[0];
            res.json(newUser);
        }
    });
});

//requests

app.get('/requests', (req, res) => {
    const query = 'SELECT * FROM requests;';

    pool.query(query, (error, result) => {
        if (error) {
            console.error('Error occurred:', error);
            res.status(500).send('An error occurred while retrieving data from the database.');
        } else {
            const requests = result.rows;
            res.json(requests);
        }
    });
});

app.get('/requests/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM requests WHERE id = $1';

    pool.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error fetching request by id:', error);
            res.status(500).send('Failed to retrieve request');
        } else {
            res.json(results.rows[0]);
        }
    });
});

app.post('/create-chat', async (req, res) => {
    const { userId, employee_id, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO requests (user_id, employee_id, dialog, status, date) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
            [userId, employee_id, '[]', status]
        );
        res.status(201).json({ message: 'New chat created successfully', requestId: result.rows[0].id });
    } catch (error) {
        console.error('Failed to create new chat:', error);
        res.status(500).send('Error creating new chat in the database');
    }
});


app.post('/update-dialog', (req, res) => {
    const { requestId, message, user_id } = req.body;
    const newMessage = JSON.stringify({ message: message, user_id: user_id });
    const query = 'UPDATE requests SET dialog = dialog || $1::jsonb WHERE id = $2';

    pool.query(query, [`[${newMessage}]`, requestId], (error, result) => {
        if (error) {
            console.error('Failed to update dialog:', error);
            res.status(500).send('Error updating dialog in the database');
        } else {
            res.json({ message: 'Dialog updated successfully', updated: result.rowCount });
        }
    });
});

app.post('/update-request-feedback', (req, res) => {
    const { requestId, feedback, grade } = req.body;
    const query = 'UPDATE requests SET feedback = $1, grade = $2 WHERE id = $3 RETURNING feedback, grade';

    pool.query(query, [feedback, grade, requestId], (error, result) => {
        if (error) {
            console.error('Failed to update request:', error);
            res.status(500).send('Error updating request in the database');
        } else {
            if (result.rows.length > 0) {
                res.json({ message: 'Request updated successfully', updatedData: result.rows[0] });
            } else {
                res.status(404).send('Request not found');
            }
        }
    });
});

app.post('/update-status', (req, res) => {
    const { requestId, status } = req.body;
    const query = 'UPDATE requests SET status = $1 WHERE id = $2 RETURNING status';

    pool.query(query, [status, requestId], (error, result) => {
        if (error) {
            console.error('Failed to update status:', error);
            res.status(500).send('Error updating status in the database');
        } else {
            res.json({ message: 'Status updated successfully', status: result.rows[0].status });
        }
    });
});


app.post('/update-employeeID', (req, res) => {
    const { requestId, employeeId } = req.body;
    const query = 'UPDATE requests SET employee_id = $1 WHERE id = $2 RETURNING *'; // Adjusted to return all columns for clarity

    pool.query(query, [employeeId, requestId], (error, result) => {
        if (error) {
            console.error('Failed to update employeeId:', error);
            res.status(500).send('Error updating employeeId in the database');
        } else {
            res.json({ message: 'Employee ID updated successfully', updatedData: result.rows[0] }); // Updated key in the response to reflect what it is
        }
    });
});






// employee

app.get('/employee', (req, res) => {
    const query = 'SELECT * FROM employee;';

    pool.query(query, (error, result) => {
        if (error) {
            console.error('Error occurred:', error);
            res.status(500).send('An error occurred while retrieving data from the database.');
        } else {
            const requests = result.rows;
            res.json(requests);
        }
    });
});

app.post('/update-last-request', (req, res) => {
    const { employeeId, requestId } = req.body;
    const query = 'UPDATE employee SET last_request_id = $1 WHERE id = $2 RETURNING last_request_id';

    pool.query(query, [requestId, employeeId], (error, result) => {
        if (error) {
            console.error('Failed to update last request ID:', error);
            res.status(500).send('Error updating last request ID in the database');
        } else {
            res.json({ message: 'Last request ID updated successfully', lastRequestId: result.rows[0].last_request_id });
        }
    });
});

app.post('/update-number-req', (req, res) => {
    const { employeeId, number } = req.body;
    const query = 'UPDATE employee SET number_req = number_req + $1 WHERE id = $2 RETURNING number_req';

    pool.query(query, [number, employeeId], (error, result) => {
        if (error) {
            console.error('Failed to update number of requests:', error);
            res.status(500).send('Error updating number of requests in the database');
        } else {
            res.json({ message: 'Number of requests updated successfully', numberReq: result.rows[0].number_req });
        }
    });
});

app.post('/update-rate', (req, res) => {
    const { employeeId, grade } = req.body;
    // Ensure the incoming grade is added to the existing grade
    const query = 'UPDATE employee SET grade = grade + $1 WHERE id = $2 RETURNING *'; // Returns all columns for verification

    pool.query(query, [grade, employeeId], (error, result) => {
        if (error) {
            console.error('Failed to update grade:', error);
            res.status(500).send('Error updating grade in the database');
        } else {
            // Check if any row was actually updated
            if (result.rows.length > 0) {
                res.json({ message: 'Grade updated successfully', grade: result.rows[0].grade });
            } else {
                res.status(404).send('Employee not found');
            }
        }
    });
});


app.get('/employees/:employeeId', (req, res) => {
    const employeeId = parseInt(req.params.employeeId);
    const query = 'SELECT * FROM employee WHERE id = $1;';

    pool.query(query, [employeeId], (error, result) => {
        if (error) {
            console.error('Error occurred:', error);
            res.status(500).send('An error occurred while retrieving employee data from the database.');
        } else {
            if (result.rows.length > 0) {
                const employee = result.rows[0];
                res.json(employee);
            } else {
                res.status(404).send('Employee not found.');
            }
        }
    });
});