const Schema = require('mongoose').Schema;

const replySchema = new Schema({
  text :{
    type : String,
    required: true,
    trim : true
  },
  delete_password : {
    type : String,
    required : true,
  },
  reported : {
    type: Boolean,
    default: false,
  }
},{
  timestamps :{
    createdAt : 'created_on',
    updatedAt : 'updated_on',
  }
});

replySchema.methods.report = function(res){
    this.reported = true;
    this.save((err,doc) =>{
      if(!err) res.send('reported');
      else res.send('error reporting reply')                  
    });
}
replySchema.methods.delete = function(res){
  this.text = '[Deleted]';
  this.save((err,doc)=>{
    if(!err) res.send('success');
    else res.status(500).send('error deleting reply from database');
  })
}

module.exports = replySchema;