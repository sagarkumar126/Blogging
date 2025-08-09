require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./server/models/post');
// ✅ correct relative path if clear.js is in root

async function clearPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const result = await Post.deleteMany({});
    console.log(`${result.deletedCount} posts deleted.`);
    process.exit();
  } catch (err) {
    console.error('Error deleting posts:', err);
    process.exit(1);
  }
}

// clearPosts();
