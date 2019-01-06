const replySchema = require('./replySchema');
const Schema = require('mongoose').Schema;

const threadSchema = new Schema({
  text :{
    type     : String,
    required : true,
    trim     : true,
  },
  replies :{
    type    : [replySchema],
    default : [],
  },
  board :{
    type     : String,
    required : true,
  },
  delete_password : {
    type     : String,
    required : true,
    trim     : true
  },
  reported : {
    type    : Boolean,
    default : false,
  }
},{
  timestamps :{
    createdAt : 'created_on',
    updatedAt : 'bumped_on',
  }
})

threadSchema.methods.addReply = function(reply,res) {
  this.replies.push(reply);
  this.save((err,doc)=>{
    if(!err) res.redirect(`/b/${this.board}/${this._id}`);
    else res.status(500).send('error saving reply');
  })
}

threadSchema.methods.reportReply = function(reply_id,res){
  const reply = this.replies.id(reply_id);
  if(!reply) res.send('failur');
  else{
    reply.reported = true;
    this.save((err,doc)=>{
      if(!err) res.send('reported');
      else res.send('failure');
    })
  }
}

threadSchema.methods.deleteReply = function(reply_id, delete_password, res){
  const reply = this.replies.id(reply_id);
  if(!reply) res.send('failure');
  else if(reply.delete_password != delete_password) res.send('incorrect password');
  else{
    reply.text = '[Deleted]';
    this.save((err,doc)=>{
      if(!err) res.send('deleted');
      else res.send('failure');
    })
  }
}

module.exports = threadSchema;