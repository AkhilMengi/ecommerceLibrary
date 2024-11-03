const express = require('express');
const mongoose = require('mongoose')
const path = require('path')
const ejsLayouts = require('express-ejs-layouts')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')

const UserRegister = require('./model/userRegister')

const Book = require('./model/books')

const app = express()

const PORT = 3500;

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Adjust the path as necessary


//Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Use express-ejs-layouts
app.use(ejsLayouts);

//MongoDB connection 

mongoose.connect("mongodb://localhost:27017/Books", {})
    .then(() => console.log('Mongoose is connected to MongoDB'))
    .catch((error) => console.log('Connection error:', error));


// Simple escape function to sanitize input
const escapeHtml = (str) => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

//Register Route
app.post('/register',
    [
        // Validation and sanitization rules
        body('FirstName')
            .trim()
            .isLength({ min: 3 }).withMessage('FirstName must be at least 3 characters long')
            .isAlphanumeric().withMessage('FirstName must contain only letters and numbers'),
        body('LastName')
            .trim()
            .isLength({ min: 3 }).withMessage('LastName must be at least 3 characters long')
            .isAlphanumeric().withMessage('Last Name must contain only letters and numbers'),
        body('phoneNumber')
            .trim()
            .isLength({ min: 10, max: 10 }).withMessage('PhoneNumber must be of 3 characters long')
            .isNumeric().withMessage('Last Name must contain only letters and numbers'),
        body('email')
            .trim()
            .isEmail().withMessage('Must be a valid email address')
            .normalizeEmail(),
        body('password')
            .trim() // Trims whitespace from the password
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
            .matches(/\d/).withMessage('Password must contain at least one number')
            .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    ], async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { FirstName, LastName, email, phoneNumber, password } = req.body;
            const existingUser = await UserRegister.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User already Exists" })
            }
            //Hashing of the password
            const hashedPassword = await bcrypt.hash(password, 10);


            //Adding sanitization to prevent XSS
            const sanitizedFirstName = escapeHtml(FirstName);
            const sanitizedLastName = escapeHtml(LastName);
            const sanitizedPhoneNumber = escapeHtml(phoneNumber)
            const sanitizedEmail = escapeHtml(email);
            const sanitizedPassword = escapeHtml(hashedPassword)
            //Creating new User

            const newUser = new UserRegister({
                FirstName: sanitizedFirstName,
                LastName: sanitizedLastName,
                email: sanitizedEmail,
                phoneNumber: sanitizedPhoneNumber,
                password: sanitizedPassword
            })

            //Save user to database
            
            await newUser.save()
            res.status(201).json({message:"User registered successfully"})
        } catch (error) {
            console.error('Registration error:', error); // Log the error to the console
            res.status(500).json({ message: 'Server error', error });
        }

    })



//login Route

app.post('/login', [
    body('email')
        .trim()
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .trim()
        .notEmpty().withMessage('Password cannot be empty')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await UserRegister.findOne({ email: escapeHtml(email) }); // Sanitize email for safety
        if (!user) {
            return res.status(400).json({ message: 'Invalid email ' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid  password' });
        }

        // Successful login
        res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Render the registration page
app.get('/register', (req, res) => {
    res.render('register',{title:'Register', errors: [] }); // Adjust the path as necessary
});

//Render the login Page
app.get('/login', (req, res) => {
    res.render('login',{title:'Login', errors: [] }); // Pass an empty errors array initially
});

//Books Route

//All Books
app.get('/', async (req, res) => {
    try {
        const filter = req.query.filter || 'all'; // Default to 'all' if no filter is set
        const selectedAuthor = req.query.author || 'all'; // Default to 'all' if no author is selected
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 20; // Default to 10 items per page

        // Get min and max price from query parameters
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

        let query = {}; // Build the query object

        if (filter === 'available') {
            query.available = true; // Only fetch available books
        }

        if (selectedAuthor !== 'all') {
            query.author = selectedAuthor; // Filter by selected author
        }

        // Calculate total number of books for pagination
        const totalBooks = await Book.countDocuments(query);
        console.log(totalBooks)
        const totalPages = Math.ceil(totalBooks / limit);
        console.log(totalPages)

        // Fetch books for the current page
        const books = await Book.find(query)
            .skip((page - 1) * limit) // Skip books from previous pages
            .limit(limit) // Limit the number of books per page
            .lean();

        // Get unique authors for the dropdown
        const authors = await Book.distinct('author'); // Fetch distinct authors from the database

        res.render('index', {
            title: 'Home Page',
            books,
            filter,
            selectedAuthor,
            authors,
            currentPage: page,
            totalPages,
            limit,
            minPrice,
            maxPrice,
        });
    } catch (error) {
        console.error('Error retrieving books:', error);
        res.status(500).render('error', { 
            title: 'Error', 
            message: 'There was an error retrieving the book list. Please try again later.' 
        });
    }
});




//One Book
// app.get('')


app.listen(PORT, () => {
    console.log(`Server is listening at ${PORT}`)
})

