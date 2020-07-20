const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Post = require('../models/post');
const Postlet = require('../models/postlet');

router.get('/', (req, res, next) => {
    Post.find()
        .select('title description _id postlets')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                posts: docs.map(doc => {
                    return {
                        title: doc.name,
                        description: doc.description,
                        _id: doc._id,
                        postlets: doc.postlets,
                        request: {
                            type: 'GET',
                            url: '/posts/' + doc.id
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

router.post('/', checkAuth, (req, res, next) => {
    const postItem = new Post({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        description: req.body.description,
        postlets: req.body.postlets,
    });
    postItem
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Created post successfully',
                createdPost: {
                    title: result.title,
                    description: result.description,
                    _id: result._id,
                    postlets: result.postlets,
                    request: {
                        type: 'GET',
                        url: '/posts/' + result.id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.get('/:postId', (req, res, next) => {
    const id = req.params.postId;
    Post.findById(id)
        .select('title description _id postlets')
        .populate('postlets')
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

router.patch('/:postId', checkAuth, (req, res, next) => {
    const id = req.params.postId;
    Post.update({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Post updated',
                request: {
                    type: 'GET',
                    url: '/posts/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});

router.delete('/:postId', checkAuth, (req, res, next) => {
    const id = req.params.postId;
    Post.findById(id)
        .select('postlets')
        .then(doc => {
            const postletIds = doc.postlets;
            for (let postletId in postletIds) {
                Postlet.findOneAndRemove({ _id: postletId }, (err, post) => {
                    if (err) console.log(err);
                })
            }
        })
    Post.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Post deleted"
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