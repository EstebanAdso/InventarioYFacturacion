const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'movilstar138@gmail.com',
        pass: '10262728'
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/send-email', upload.single('pdf'), (req, res) => {
    const { to, subject, text } = req.body;
    const pdfPath = req.file.path;
    const pdfName = req.file.originalname;

    const mailOptions = {
        from: 'movilstar138@gmail.com',
        to,
        subject,
        text,
        attachments: [
            {
                filename: pdfName,
                path: pdfPath
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        fs.unlink(pdfPath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });

        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('Email sent');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
