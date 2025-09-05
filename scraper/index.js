const path = require('path');
const process = require('process');
const fetch = require('node-fetch'); // needed if Node < 18
const fs = require('fs');
const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Book Schema
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  stock: { type: String, required: true },
  rating: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  lastScraped: { type: Date, default: Date.now }
});

// Use (title + price) as unique key to avoid overwriting duplicate titles
BookSchema.index({ title: 1, price: 1 }, { unique: true });

const Book = mongoose.model('Book', BookSchema);

// Helpers
async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
  return filepath;
}

async function uploadToCloudinary(filepath) {
  try {
    const result = await cloudinary.uploader.upload(filepath, {
      folder: 'book-explorer-thumbnails'
    });
    fs.unlinkSync(filepath); // Delete local file after upload
    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    return null;
  }
}

async function scrapeBooks() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // helpful in hosting
  });

  const page = await browser.newPage();
  let next_page = 'https://books.toscrape.com/';

  while (next_page) {
    console.log(`🔎 Visiting: ${next_page}`);
    await page.goto(next_page, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.product_pod');

    const books = await page.evaluate(() => {
      const bookData = [];
      document.querySelectorAll('.product_pod').forEach(book => {
        const title = book.querySelector('h3 a').getAttribute('title');
        const price = book.querySelector('.price_color').innerText;
        const stock = book.querySelector('.availability').innerText.trim();
        const rating = book.querySelector('.star-rating').className.replace('star-rating ', '');
        const relativeUrl = book.querySelector('.image_container img').getAttribute('src');
        const thumbnailUrl = new URL(relativeUrl, 'https://books.toscrape.com/').href;
        bookData.push({ title, price, stock, rating, thumbnailUrl });
      });
      return bookData;
    });

    for (const book of books) {
      try {
        const imageFilename = path.basename(book.thumbnailUrl);
        const tempDir = path.join(__dirname, 'temp_images');
        const localImagePath = path.join(tempDir, imageFilename);

        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
        }

        await downloadImage(book.thumbnailUrl, localImagePath);
        const cloudinaryUrl = await uploadToCloudinary(localImagePath);

        if (cloudinaryUrl) {
          await Book.findOneAndUpdate(
            { title: book.title, price: book.price }, // avoid duplicates
            { ...book, cloudinaryUrl, lastScraped: Date.now() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          console.log(`✅ Saved: "${book.title}" (${book.price})`);
        }
      } catch (error) {
        console.error(`❌ Error processing "${book.title}":`, error);
      }
    }

    // Handle pagination
    const nextButton = await page.$('.pager .next a');
    next_page = nextButton
      ? new URL(await page.$eval('.pager .next a', a => a.getAttribute('href')), page.url()).href
      : null;
  }

  await browser.close();
  await mongoose.connection.close();
  console.log('🎉 Scraping complete and MongoDB disconnected.');
}

// Run scraper
scrapeBooks().catch(console.error);

