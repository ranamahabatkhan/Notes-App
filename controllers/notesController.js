const Note = require('../models/Note');

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

exports.home = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render('index', { 
                notes: [], 
                user: null,
                searchQuery: ''
            });
        }
        
        const searchQuery = req.query.search || '';
        let query = { user: req.session.user.id };
        
        if (searchQuery) {
            query.$text = { $search: searchQuery };
        }
        
        const notes = await Note.find(query)
            .populate('user', 'username')
            .populate('comments.user', 'username')
            .sort({ createdAt: -1 });
        
        res.render('index', { 
            notes, 
            user: req.session.user,
            searchQuery 
        });
    } catch (error) {
        res.status(500).render('error', { error: 'Failed to load notes' });
    }
};

exports.listNotes = async (req, res) => {
  const search = req.query.search || '';
  const query = {
    user: req.session.user.id,
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ]
  };
  const notes = await Note.find(search ? query : { user: req.session.user.id }).sort({ createdAt: -1 });
  res.render('index', { notes, searchQuery: search, user: req.session.user });
};

exports.createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }
        
        const note = new Note({
            title,
            content,
            user: req.session.user.id
        });
        
        await note.save();
        res.redirect('/notes'); // Redirect to /notes instead of /
    } catch (error) {
        res.status(500).render('error', { error: 'Failed to create note' });
    }
};

exports.editNote = async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.session.user.id });
  if (!note) return res.redirect('/notes');
  res.render('edit', { note });
};

exports.updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }
        
        const note = await Note.findOneAndUpdate(
            { _id: id, user: req.session.user.id },
            { title, content },
            { new: true }
        );
        
        if (!note) {
            return res.redirect('/notes');
        }
        
        res.redirect('/notes');
    } catch (error) {
        res.status(500).render('error', { error: 'Failed to update note' });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }
        
        const note = await Note.findOneAndDelete({
            _id: id,
            user: req.session.user.id
        });
        
        if (!note) {
            return res.redirect('/notes');
        }
        
        res.redirect('/notes');
    } catch (error) {
        res.status(500).render('error', { error: 'Failed to delete note' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { content } = req.body;
        
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }
        
        const note = await Note.findOne({
            _id: noteId,
            user: req.session.user.id
        });
        
        if (!note) {
            return res.status(404).render('error', { error: 'Note not found' });
        }
        
        note.comments.push({
            user: req.session.user.id,
            content
        });
        
        await note.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).render('error', { error: 'Failed to add comment' });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { noteId, commentId } = req.params;
        
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }
        
        const note = await Note.findOne({
            _id: noteId,
            user: req.session.user.id
        });
        
        if (!note) {
            return res.status(404).render('error', { error: 'Note not found' });
        }
        
        note.comments = note.comments.filter(
            comment => comment._id.toString() !== commentId
        );
        
        await note.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).render('error', { error: 'Failed to delete comment' });
    }
};

// Export middleware
exports.requireAuth = requireAuth;