const express = require('express');
const router = express.Router();
const Post = require('../models/post');


router.get('', async (req, res) => {
  try {
    const perPage = 10;
    const page = parseInt(req.query.page) || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = page + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    console.log({ current: page, nextPage, hasNextPage, total: count });

    res.render('index', {
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/',  // homepage route
      showAddButton: true // <-- ADD THIS LINE
    });
  } catch (error) {
    console.log(error);
  }
});


async function insertPost() {
  const count = await Post.countDocuments();
  if (count === 0) {
    await Post.insertMany([
      { title: "The Lost City", Body: "Explorers uncovered an ancient city buried beneath the jungle." },
      { title: "Skyfire", Body: "A meteor shower lights up the night sky in a breathtaking display." },
      { title: "Echoes of the Past", Body: "A historian uncovers secrets hidden for centuries." },
      { title: "The Clockmaker", Body: "A mysterious old man builds clocks that manipulate time." },
      { title: "Underwater Realm", Body: "Divers find a glowing cave deep in the Pacific Ocean." },
      { title: "The Last Message", Body: "A cryptic radio signal warns of an impending disaster." },
      { title: "Dreamcatcher", Body: "A girl discovers her dreams are portals to other worlds." },
      { title: "The Ice Fortress", Body: "A team of scientists explores an abandoned arctic station." },
      { title: "Mirage Town", Body: "A town appears in the desert that isn’t on any map." },
      { title: "Code Zeta", Body: "Hackers uncover a top-secret government AI experiment." },
      { title: "The Phoenix Blade", Body: "A warrior seeks a mythical sword said to never dull." },
      { title: "Parallel Lives", Body: "Two people in alternate realities begin to share memories." },
      { title: "Quantum Thief", Body: "A thief steals information by bending the rules of time." },
      { title: "Library of Whispers", Body: "A library where books can talk holds forbidden knowledge." },
      { title: "Stormbreakers", Body: "Elite pilots fly into storms to mine energy from lightning." },
      { title: "The Forgotten Planet", Body: "Astronauts find a planet missing from the star charts." },
      { title: "Neon Samurai", Body: "In a futuristic Tokyo, a lone samurai protects the innocent." },
      { title: "Voices in the Fog", Body: "A town is haunted by whispers whenever fog rolls in." },
      { title: "Biohackers", Body: "Students experiment with human enhancement tech—illegally." },
      { title: "The Golden Key", Body: "An orphan finds a key that opens doors to impossible places." },
    ]);
    console.log('Posts inserted');
  } else {
    console.log('Posts already exist, skipping insertion');
  }
}

// insertPost();

router.get('/post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    res.render('post', {
      data: post,
      currentRoute: `/post/${req.params.id}`,  // individual post route
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

router.post('/search', async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    console.log(searchTerm);
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { Body: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
      ]
    });

    res.render("search", {
      data,
      searchTerm,
      currentRoute: '/search',  // search route
    });

  } catch (error) {
    console.log(error);
  }
});

router.get('/about', (req, res) => {
  res.render('about', {
    currentRoute: '/about',  // about page route
  });
});


router.get('/', (req, res) => {
  res.render('index', { currentRoute: '/' });
});

router.get('/about', (req, res) => {
  res.render('about', { currentRoute: '/about' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { currentRoute: '/contact' });
});



module.exports = router;
