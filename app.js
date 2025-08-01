const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Session configuration for connect-mongo v4
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Authentication middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/', notesRoutes); // Home route

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 