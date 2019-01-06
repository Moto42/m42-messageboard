/*
   
  app.route('/api/replies/:board')
  
    .get(replyHandler.replyList)
      gets list from DB, strips secure data
      res.json(-the replies in an array
    .post(replyHandler.newReply)
      shove new reply into the DB
      res.redirect('/b/:board/:thread_id
    .put(replyHandler.reportReply)
      report reply in DB
      res.send('reported')
    .delete(replyHandler.deleteReply);
      check that the password is correct
      set reply.text to '[deleted]'
      res.send('success' or 'incorrect password')

*/

var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var url = process.env.DB;

const Reply = mongoose.model( 'Reply', require('../schema/replySchema') );
const Thread = mongoose.model( 'Thread', require('../schema/threadSchema') );

mongoose.connect(url);

module.exports = function(){
  
    
  this.replyList = function(req, res){
    // gets list from DB, strips secure data
    // res.json(-the replies in an array
    const board     = req.params.board;
    const thread_id = req.query.thread_id;
    Thread.findById(thread_id)
      .select({
        reported: 0,
        delete_password: 0,
        "replies.delete_password": 0,
        "replies.reported": 0
      })
      .then(thread  => res.send(thread))
      .catch(err=>console.log(err))
  }
  
  this.newReply = function(req, res){
    // shove new reply into the DB
    // res.redirect('/b/:board/:thread_id
    const board     = req.params.board;
    const thread_id = req.body.thread_id;
    const reply = Reply({
      text : req.body.text,
      delete_password : req.body.delete_password,
    });
    Thread.findOne({_id : thread_id})
      .then(thread =>{
        thread.addReply(reply,res,board,thread_id);
      })
  }
  this.reportReply = function(req, res){
    // report reply in DB
    // res.send('reported')
    const reply_id = req.body.reply_id;
    const thread_id = req.body.thread_id;
    Thread.findOne({_id : thread_id})
      .then(thread => thread.reportReply(reply_id,res))
      .catch(err => console.log(err))
  }
  this.deleteReply = function(req, res){
    // check that the password is correct
    // set reply.text to '[deleted]'
    // res.send('success' or 'incorrect password')
    const reply_id = req.body.reply_id;
    const thread_id = req.body.thread_id;
    const delete_password = req.body.delete_password;
    Thread.findOne({_id : thread_id})
      .then(thread => thread.deleteReply(reply_id,delete_password,res))
      .catch(err => console.log(err))
  }
  
}