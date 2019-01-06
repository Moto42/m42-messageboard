/*
app.route('/api/threads/:board')
    .get(threadHandler.threadList)
      // assembles list of threads
      //   top ten.
      //   only last 3 replies.
      // respons with res.json(docs) of the threads
    .post(threadHandler.newThread)
      // puts thread into DB
      // sends redirect
    .put(threadHandler.reportThread)
      // updates 'reported' status
      // sends res.text('reported')
    .delete(threadHandler.deleteThread);
      // attempts to delete it.
      // sends res.text 'incorrect password' or 'success'
    
*/
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var url = process.env.DB;

var Thread = mongoose.model('Thread',require('../schema/threadSchema'))

module.exports = function(){
  
  this.threadList = function(req, res){
  // assembles list of top 10 threads
  // top ten.
  // only last 3 replies.
  const board = req.params.board;
  Thread.find({board:board})
    .select({
      reported                 : 0,
      delete_password          : 0,
      "replies.reported"       : 0,
      "replies.delete_password": 0,
    })
    .sort('-bumped_on')
    .limit(10)
    .then(threads =>{ 
      threads.forEach(thread =>{
        if(thread.replies.length > 3) thread.replies = thread.replies.slice(-3);
      })
      return threads
    })
    .then(threads => {
      res.json(threads);
    })
  }  
  
  this.newThread = function(req, res){
    // puts thread into DB
    // sends redirect
    const board = req.params.board;
    const text  = req.body.text;
    const delete_password = req.body.delete_password;
    
    var thread = Thread({
      text : text,
      delete_password : delete_password,
      board : board,
    });
    thread.save((err,doc) => {
      if(!err) res.redirect(`/b/${board}/`);
      else {
        console.log(err);
        res.send('failed to create new thread');
      }
    })
  }
  
  this.reportThread = function(req, res){
    const thread_id = req.body.thread_id;
    Thread.updateOne({ _id: thread_id }, { $set: { reported:true }}, function(err){
      if(!err) res.send('reported');
      else res.status(500).send('reporting error')
    })
  }
  
  this.deleteThread = function(req, res){
    const thread_id = req.body.thread_id;
    const delete_password = req.body.delete_password;
    Thread.findById(thread_id)
      .exec((err, doc) => {
        if(!doc) res.send('thread not found')
        else if(doc.delete_password === delete_password){
          Thread.deleteOne({_id:thread_id},err =>{
            if(!err) res.send('success');
            else res.stautus(500).send('error');
          })
        }
        else res.send('incorrect password')
      })
  }
  
  this.deleteBoard = function(req,res){
    const board = req.body.board;
    const password = req.body.password;
    const BOARD_DELETE_PASSWORD = process.env.BOARD_DELETE_PASSWORD;
    if(password === BOARD_DELETE_PASSWORD) {
      Thread.deleteMany({board : board},function(err){
        if(!err) res.send('deleted');
        else res.send('error deleting board');
      })
    }
    else res.send('incorrect password');
  }
}