const mongoose = require('mongoose');
const fs = require('fs');
const Route = require('../Route');
const Location = require('../Location');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected successfully to the database");

    insertLocations()
        .then(insertRoutes)
        .then(() => mongoose.connection.close());

});

async function insertLocations() {
    const locationsData = JSON.parse(fs.readFileSync('data/locations.json', 'utf8'));
    await Location.deleteMany({});
    await Location.insertMany(locationsData)
        .then(() => {
            console.log("Locations inserted successfully");
        })
        .catch(err => {
            console.error("Error inserting Locations: ", err);
        });
}

async function insertRoutes() {
    const routesData = JSON.parse(fs.readFileSync('data/routes.json', 'utf8'));
    await Route.deleteMany({});
    await Route.insertMany(routesData)
        .then(() => {
            console.log("Routes inserted successfully");
        })
        .catch(err => {
            console.error("Error inserting Routes: ", err);
        });
}
