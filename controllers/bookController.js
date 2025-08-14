const Book = require('../models/bookModel');

//add new book
exports.addBookController = async (req, res) => {
  try {
    const { title, author, description, coverImageUrl } = req.body;

    if (!title || !author || !description || !coverImageUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newBook = new Book({ title, author, description, coverImageUrl });
    await newBook.save();

    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//get all books
exports.getAllBooksController = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// get single book by ID 
exports.getBookByIdController = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('reviews');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// add a review to a book
exports.addReviewController = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const alreadyReviewed = book.reviews.find(
      (r) => r.user.toString() === req.payload.userId
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Book already reviewed by this user' });
    }

    const review = {
      user: req.payload.userId,
      name: req.payload.name, 
      rating: Number(rating),
      comment
    };

    book.reviews.push(review);
    book.numReviews = book.reviews.length;
    book.averageRating =
      book.reviews.reduce((acc, item) => item.rating + acc, 0) /
      book.reviews.length;

    await book.save();

    res.status(201).json({ message: 'Review added', reviews: book.reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update review by reviewId
exports.updateReviewController = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { bookId, reviewId } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const review = book.reviews.id(reviewId); 
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.payload.userId) {
      return res.status(403).json({ message: 'You can only edit your own review' });
    }

    review.rating = Number(rating);
    review.comment = comment;

    //calculate average rating
    book.averageRating =
      book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length;

    await book.save();

    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
