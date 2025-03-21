// Import required packages
// source by @hiyaok on telegram.
const { Telegraf } = require('telegraf');
const axios = require('axios');

// Bot configuration
// by hiyaok
const TOKEN = '7159296599:AAEpX_rCZsjxjw30OEK7CuX2WY-TvezREQA';
const SHEET_ID = '1rk1d5MQByRpUz6WPyZRqBJp3QYeiv_vQF1NnR2M2gNQ';
const SHEET_NAME = 'Sheet1';

// itu dibagian TOKEN ganti dengan TOKEN BOT , SHEET ID ganti dengan ID SHEETS kamu, SHEET NAME ganti dengan name kamu

// Initialize the bot
const bot = new Telegraf(TOKEN);

// Function to get sheet data directly using public spreadsheet URL
// jangan di apa apain udah
async function getSheetData() {
  try {
    const response = await axios.get(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`
    );
    
    // Parse CSV data
    const rows = response.data.split('\n').map(row => 
      row.split(',').map(cell => 
        // Remove quotes from cell values
        cell.replace(/^"(.*)"$/, '$1')
      )
    );
    
    return rows;
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error);
    return [];
  }
}

// Function to get unique categories from sheet
async function getUniqueCategories() {
  const data = await getSheetData();
  const categories = new Set();
  
  // Start from row 1 (index 1) to skip header
  for (let i = 1; i < data.length; i++) {
    // Check column B (index 1) for categories (KET)
    if (data[i][1] && data[i][1].trim() !== '') {
      categories.add(data[i][1]);
    }
  }
  
  return Array.from(categories).sort();
}

// Function to generate help message
async function generateHelpMessage() {
  const categories = await getUniqueCategories();
  let helpMessage = "List perintah yang bisa digunakan:\n\n";
  helpMessage += "/start - Perintah untuk memulai bot.\n";
  
  // Add standard marketplace commands
  helpMessage += "/jaguar33 - Perintah untuk link marketplace jaguar33.\n";
  helpMessage += "/mustang303 - Perintah untuk link marketplace mustang303.\n";
  helpMessage += "/qqfullbet - Perintah untuk link marketplace qqfullbet.\n";
  helpMessage += "/idn33 - Perintah untuk link marketplace idn33.\n";
  
  return helpMessage;
}

// Function to generate response based on category
async function generateCategoryResponse(category) {
  const data = await getSheetData();
  let response = `========== Kategori Produk ==========:\n`;
  let count = 1;
  let foundCategory = false;
  
  // Start from row 1 to skip header
  for (let i = 1; i < data.length; i++) {
    // Check category in columns B/D/F/H (case-insensitive)
    if (
      (data[i][1] && data[i][1].toLowerCase() === category.toLowerCase()) ||
      (data[i][3] && data[i][3].toLowerCase() === category.toLowerCase()) ||
      (data[i][5] && data[i][5].toLowerCase() === category.toLowerCase()) ||
      (data[i][7] && data[i][7].toLowerCase() === category.toLowerCase())
    ) {
      foundCategory = true;
      
      // Display category name and sequence number
      response += `${count}. ${category.toUpperCase()}\n`;
      
      // Add links from all available marketplaces for this category
      if (data[i][0]) { // mustang303
        response += `Link 👉 ${data[i][0]}\n`;
      }
      
      if (data[i][2]) { // jaguar33
        response += `Link 👉 ${data[i][2]}\n`;
      }
      
      if (data[i][4]) { // idn33
        response += `Link 👉 ${data[i][4]}\n`;
      }
      
      if (data[i][6]) { // qqfullbet
        response += `Link 👉 ${data[i][6]}\n`;
      }
      
      count++;
    }
  }
  
  if (!foundCategory) {
    return "Kategori tidak ditemukan!";
  }
  
  return response;
}

// Function to generate response based on marketplace
async function generateMarketplaceResponse(marketplace) {
  const data = await getSheetData();
  let response = `===== Kategori Produk =====:\n`;
  let count = 1;
  
  // Determine which column to use
  let colIndex;
  if (marketplace.toUpperCase() === 'mustang303') {
    colIndex = 0; // Column A (index 0) for mustang303
  } else if (marketplace.toUpperCase() === 'jaguar33') {
    colIndex = 2; // Column C (index 2) for jaguar33
  } else if (marketplace.toUpperCase() === 'idn33') {
    colIndex = 4; // Column E (index 4) for idn33
  } else if (marketplace.toUpperCase() === 'qqfullbet') {
    colIndex = 6; // Column G (index 6) for qqfullbet
  } else {
    return "Marketplace tidak ditemukan!";
  }
  
  // Start from row 1 to skip header
  for (let i = 1; i < data.length; i++) {
    // Make sure there's data in the link and category columns
    if (data[i][colIndex] && data[i][colIndex+1]) {
      response += `${count}. ${data[i][colIndex+1]}\n`;
      response += `Link 👉 ${data[i][colIndex]}\n\n`;
      count++;
    }
  }
  
  if (count === 1) {
    return "Tidak ada produk untuk marketplace ini!";
  }
  
  return response;
}

// Bot commands
bot.start((ctx) => {
  ctx.reply("Halo, perkenalkan saya ini bot!\nDibuat dengan Node.js dan Telegraf\n\npilih perintah /help untuk melihat comand lainnya.");
});

bot.help(async (ctx) => {
  const helpMessage = await generateHelpMessage();
  ctx.reply(helpMessage);
});

bot.command('mustang303', async (ctx) => {
  const response = await generateMarketplaceResponse('mustang303');
  ctx.reply(response);
});

bot.command('jaguar33', async (ctx) => {
  const response = await generateMarketplaceResponse('jaguar33');
  ctx.reply(response);
});

bot.command('qqfullbet', async (ctx) => {
  const response = await generateMarketplaceResponse('qqfullbet');
  ctx.reply(response);
});

bot.command('idn33', async (ctx) => {
  const response = await generateMarketplaceResponse('idn33');
  ctx.reply(response);
});

// Handle other commands (categories)
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Check if it's a command
  if (text.startsWith('/')) {
    // Extract the search term
    const searchTerm = text.replace('/', '').toUpperCase();
    
    // Check if searchTerm is one of the categories
    const categories = await getUniqueCategories();
    const matchedCategory = categories.find(cat => 
      cat.toUpperCase() === searchTerm
    );
    
    if (matchedCategory) {
      const response = await generateCategoryResponse(matchedCategory);
      ctx.reply(response);
    } else {
      ctx.reply("Perintah tidak dikenali. Gunakan /help untuk melihat daftar perintah.");
    }
  }
});

// Start bot with long polling
bot.launch().then(() => {
  console.log('Bot started in polling mode');
}).catch(err => {
  console.error('Error starting bot:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
