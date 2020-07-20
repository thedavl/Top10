const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: (req, file, callback) =>  {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + file.originalname);
    }
})

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callback(null, true);
    } else {
        callback(null, false);
        // or pass back an error
        // callback(new Error('Filetype not allowed', false))
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const Postlet = require('../models/postlet');
const Post = require('../models/post');

router.get('/', (req, res, next) => {
    Postlet.find()
        .select('numbering title description _id postletImage postId')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                posts: docs.map(doc => {
                    return {
                        _id: doc._id,
                        numbering: doc.numbering,
                        title: doc.title,
                        description: doc.description,
                        postletImage: doc.postletImage,
                        postId: doc.postId,
                        request: {
                            type: 'GET',
                            url: '/postlets/' + doc.id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', checkAuth, upload.single('postletImage'), (req, res, next) => {
    console.log(req.file);
    const postletItem = new Postlet({
        _id: new mongoose.Types.ObjectId(),
        numbering: req.body.numbering,
        title: req.body.title,
        description: req.body.description,
        postletImage: req.file.path,
        postId: req.body.postId
    });
    const id = req.body.postId;
    postletItem
        .save()
        .then(result => {
            console.log(result);
            Post.findOne({ _id: id }, (err, post) => {
                if (post) {
                    post.postlets.push(postletItem)
                    post.save()
                    res.status(201).json({
                        message: 'Postlet created successfully',
                        createdPostlet: {
                            _id: result._id,
                            numbering: result.numbering,
                            title: result.title,
                            description: result.description,
                            postletImage: result.postletImage,
                            postId: result.postId,
                            request: {
                                type: 'GET',
                                url: '/postlets/' + result.id
                            }
                        }
                    });
                } else {
                    res.status(404).json({ message: "Provided post not found" })
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.get('/:postletId', (req, res, next) => {
    const id = req.params.postletId;
    Postlet.findById(id)
        .select('numbering title description _id postletImage postId')
        .exec()
        .then(doc => {
            console.log("From Database", doc);
            if (doc) {
                res.status(200).json(doc);
            } else {
                res.status(404).json({ message: "No valid entry for provided ID" })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});

router.patch('/:postletId', checkAuth, (req, res, next) => {
    const id = req.params.postletId;
    Postlet.update({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Postlet updated',
                request: {
                    type: 'GET',
                    url: '/postlets/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});

router.delete('/:postletId', checkAuth, (req, res, next) => {
    const id = req.params.postletId;
    Postlet.findById(id)
        .exec()
        .then(docs => {
            const postId = docs.postId;
            Post.findOne({ _id: postId }, (err, post) => {
                if (post) {
                    post.postlets.pull(id);
                    post.save();
                }
            })
        })
    Postlet.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Postlet deleted"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;