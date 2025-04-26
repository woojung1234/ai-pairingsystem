const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const csv = require('csv-parser');
const Liquor = require('../models/Liquor');
const Ingredient = require('../models/Ingredient');
const Pairing = require('../models/Pairing');

// Connect to MongoDB
const connectDB = require('./db');

// Path to data files
const DATA_DIR = path.join(__dirname, '../../../ai-server/dataset');
const NODES_FILE = path.join(DATA_DIR, 'nodes_191120_updated.csv');
const EDGES_FILE = path.join(DATA_DIR, 'edges_191120_updated.csv');
const GOOD_PAIRINGS_FILE = path.join(__dirname, '../../../ai-server/liquor_good_ingredients.csv');

async function initDatabase() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Checking if database is already initialized...');
    
    // Check if data already exists
    const liquorCount = await Liquor.countDocuments();
    const ingredientCount = await Ingredient.countDocuments();
    
    if (liquorCount > 0 || ingredientCount > 0) {
      console.log('Database already has data. Skipping initialization.');
      return;
    }
    
    console.log('Starting database initialization...');
    
    // Import nodes (liquors and ingredients)
    await importNodes();
    
    // Import good pairings
    await importGoodPairings();
    
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    // mongoose.connection.close();
  }
}

// Import nodes from CSV file
async function importNodes() {
  return new Promise((resolve, reject) => {
    console.log('Importing nodes...');
    
    const liquors = [];
    const ingredients = [];
    
    fs.createReadStream(NODES_FILE)
      .pipe(csv())
      .on('data', (row) => {
        // Convert node_id to integer
        const nodeId = parseInt(row.node_id);
        
        // Skip if node_id is not a number
        if (isNaN(nodeId)) return;
        
        if (row.node_type === 'liquor') {
          liquors.push({
            liquor_id: nodeId,
            name: row.name || `Liquor ${nodeId}`,
            type: 'Unknown',
            description: '',
            is_hub: row.is_hub === 'hub'
          });
        } else if (row.node_type === 'ingredient') {
          ingredients.push({
            ingredient_id: nodeId,
            name: row.name || `Ingredient ${nodeId}`,
            category: 'Unknown',
            description: '',
            is_hub: row.is_hub === 'hub'
          });
        }
        // Skip 'compound' nodes as they're not directly needed in the database
      })
      .on('end', async () => {
        try {
          // Insert liquors
          console.log(`Inserting ${liquors.length} liquors...`);
          if (liquors.length > 0) {
            await Liquor.insertMany(liquors);
          }
          
          // Insert ingredients
          console.log(`Inserting ${ingredients.length} ingredients...`);
          if (ingredients.length > 0) {
            await Ingredient.insertMany(ingredients);
          }
          
          console.log('Nodes import complete');
          resolve();
        } catch (error) {
          console.error('Error inserting nodes:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading nodes file:', error);
        reject(error);
      });
  });
}

// Import good pairings from CSV file
async function importGoodPairings() {
  return new Promise((resolve, reject) => {
    console.log('Importing good pairings...');
    
    const pairings = [];
    
    fs.createReadStream(GOOD_PAIRINGS_FILE)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          const liquorId = parseInt(row.liquor_id);
          const ingredientId = parseInt(row.ingredient_id);
          
          // Skip if IDs are not numbers
          if (isNaN(liquorId) || isNaN(ingredientId)) return;
          
          // Find the corresponding documents
          const liquor = await Liquor.findOne({ liquor_id: liquorId });
          const ingredient = await Ingredient.findOne({ ingredient_id: ingredientId });
          
          if (liquor && ingredient) {
            pairings.push({
              liquor: liquor._id,
              ingredient: ingredient._id,
              score: 0.8, // Default good score
              reason: row.origin || 'Historical pairing',
              shared_compounds: []
            });
          }
        } catch (error) {
          console.error('Error processing pairing row:', error);
        }
      })
      .on('end', async () => {
        try {
          console.log(`Inserting ${pairings.length} pairings...`);
          if (pairings.length > 0) {
            // Insert in batches to avoid overwhelming the database
            const batchSize = 1000;
            for (let i = 0; i < pairings.length; i += batchSize) {
              const batch = pairings.slice(i, i + batchSize);
              await Pairing.insertMany(batch, { ordered: false });
              console.log(`Inserted batch ${i/batchSize + 1}/${Math.ceil(pairings.length/batchSize)}`);
            }
          }
          console.log('Good pairings import complete');
          resolve();
        } catch (error) {
          console.error('Error inserting pairings:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading pairings file:', error);
        reject(error);
      });
  });
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database initialization script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error in database initialization script:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;
