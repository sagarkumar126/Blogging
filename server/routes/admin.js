const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/admin'); // <-- redirect to login page
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.redirect('/admin'); // <-- redirect if token invalid
  }
};


router.get('/admin', async (req, res) => {
  try {
    res.render('admin/index', { layout: adminLayout, currentRoute: '/admin' });
  } catch (error) {
    console.log(error);
  }
});

router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });

    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const data = await Post.find();
    res.render('admin/dashboard', {
      data,
      layout: adminLayout,
      currentRoute: '/dashboard',
    });
  } catch (error) {}
});

router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const data = await Post.find();
    res.render('admin/add-post', {
      data,
      layout: adminLayout,
      currentRoute: '/add-post',
    });
  } catch (error) {}
});

// When creating a new post
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const newPost = new Post({
  title: req.body.title,
  Body: req.body.body,
  author: req.userId  // current logged-in user's id
});


    await Post.create(newPost);

    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});

// Edit post page - only if user is author
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    if (post.author.toString() !== req.userId) {
      return res.status(403).send('You cannot edit this post');
    }

    res.render('admin/edit-post', {
      data: post,
      layout: adminLayout,
      currentRoute: '/edit-post',
    });
  } catch (error) {
    console.log(error);
  }
});

// Update post - only if user is author
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.author.toString() !== req.userId) {
      return res.status(403).send('You cannot update this post');
    }

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      Body: req.body.body,
      updatedAt: Date.now(),
    });

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});

// Delete post - only if user is author
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.author.toString() !== req.userId) {
      return res.status(403).send('You cannot delete this post');
    }

    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});


// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Show register page
router.get('/register', (req, res) => {
  res.render('admin/register', { layout: adminLayout, currentRoute: '/register' });
});

// Handle registration form
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email.endsWith('@gmail.com')) {
      return res.status(400).send('Registration allowed only with Gmail');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username: email, password: hashedPassword });
      res.status(201).send('User Created Successfully. Please login.');
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).send('User already exists');
      } else {
        res.status(500).send('Internal Server Error');
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/register', (req, res) => {
  res.render('admin/register', { layout: adminLayout, currentRoute: '/register' });
});

router.get('/login', (req, res) => {
  res.render('admin/login', { layout: adminLayout, currentRoute: '/login' });
});



module.exports = router;
