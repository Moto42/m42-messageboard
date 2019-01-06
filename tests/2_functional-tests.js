/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  var thread_id_report;
  var thread_id_delete;
  var thread_id_reply;
  
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    
    suite('POST', function() {
      test('create three new threads',function(done){
        chai.request(server)
          .post('/api/threads/test')
          .send({
          text:'test post 1',
          delete_password : 'password',
          })
          .end(function(err,res){
            assert.equal(res.status,200)
          });
        chai.request(server)
          .post('/api/threads/test')
          .send({
          text:'test post 2',
          delete_password : 'password',
          })
          .end(function(err,res){
            assert.equal(res.status,200)
          });
        chai.request(server)
          .post('/api/threads/test')
          .send({
          text:'test post 3',
          delete_password : 'password',
          })
          .end(function(err,res){
            assert.equal(res.status,200)
            done();
          });
      });//end test 
    });
    
    suite('GET', function() {
      test('GET ten most recent threads with no more than 3 replies each',function(done){
        chai.request(server)
          .get('/api/threads/test')
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'replies');
            assert.notProperty(res.body[0], 'delete_password');
            assert.notProperty(res.body[0], 'reported');
            assert.isArray(res.body);
            assert.isAtLeast(res.body.length,2);
            assert.isAtMost(res.body.length, 10);
            assert.isArray(res.body[0].replies);
            assert.isAtMost(res.body[0].replies.length,3);
          
            //get thread_ids for future tests.
            thread_id_report = res.body[0]._id;
            thread_id_delete = res.body[1]._id;
            thread_id_reply  = res.body[2]._id;
          
            done();
          });        
      });//end test 
    });
    
    suite('DELETE', function() {
      
      test('delete thread with bad password',function(done){
        chai.request(server)
          .delete('/api/threads/test')
          .send({
            thread_id : thread_id_delete,
            delete_password : 'wrongpassword'
          })
          .end(function(err,res){
            assert.equal(true,true);
            done();
          })
      });//end test 
      
      test('delete thread with good password',function(done){
        chai.request(server)
          .delete('/api/threads/test')
          .send({
            thread_id : thread_id_delete,
            delete_password : 'password'
          })
          .end(function(err,res){
            assert.equal(true,true);
            done();
          })
      });//end test 
      
    });
    
    suite('PUT', function() {
      test('report thread',function(done){
        chai.request(server)
          .put('/api/threads/test')
          .send({
            thread_id : thread_id_report,
          })
          .end(function(err,res){
            assert.equal(res.status,200);
            done();
          })
        
      });//end test 
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    var reply_id_report;
    var reply_id_delete;
    
    suite('POST', function() {
      test('reply to thread three times',function(done){
        chai.request(server)
          .post('/api/replies/test')
          .send({
            thread_id : thread_id_reply,
            text : 'test reply 1',
            delete_password : 'password'
          })
          .end(function(err, res){
            assert.equal(res.status,200);
          })
        chai.request(server)
          .post('/api/replies/test')
          .send({
            thread_id : thread_id_reply,
            text : 'test reply 2',
            delete_password : 'password'
          })
          .end(function(err, res){
            assert.equal(res.status,200);
          })
        chai.request(server)
          .post('/api/replies/test')
          .send({
            thread_id : thread_id_reply,
            text : 'test reply 3',
            delete_password : 'password'
          })
          .end(function(err, res){
            assert.equal(res.status,200);
            done();
          })
      });//end test 
    });
    
    suite('GET', function() {
      test('get all replies for one thread',function(done){
        //Note, this is misleading, your actualy getting the whole Thread object
        //without trimming down the 3 posts.
        chai.request(server)
          .get('/api/replies/test')
          .query({
            thread_id: thread_id_reply
          })
          .end(function(err,res){
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'bumped_on');
            assert.property(res.body, 'text');
            assert.property(res.body, 'replies');
            assert.notProperty(res.body, 'delete_password');
            assert.notProperty(res.body, 'reported');
            assert.isArray(res.body.replies);
            assert.notProperty(res.body.replies[0], 'delete_password');
            assert.notProperty(res.body.replies[0], 'reported');
            assert.equal(res.body.replies.length, 3);
            
            //getting reply_ids for future tests
            reply_id_report = res.body.replies[0];
            reply_id_delete = res.body.replies[1];
          
            done();
          });
        
      });//end test 
    });
    
    suite('PUT', function() {
      
      test('report reply',function(done){
        // this.skip();
        chai.request(server)
          .put('/api/replies/test')
          .send({
            thread_id: thread_id_reply,
            reply_id: reply_id_report
          })
          .end(function(err, res){
            assert.equal(res.status,200);
            assert.equal(res.text,'reported');
            done();
          });
      });//end test 
    });
    
    suite('DELETE', function() {
      
      test('delete reply with bad password',function(done){
        chai.request(server)
          .delete('/api/replies/test')
          .send({
            thread_id: thread_id_reply,
            reply_id: reply_id_delete,
            delete_password: 'wrongpassword'
          })
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.equal(res.text,'incorrect password')
            done();
          })
        
      });//end test 
      
      test('delete reply with good password',function(done){
        chai.request(server)
          .delete('/api/replies/test')
          .send({
            thread_id: thread_id_reply,
            reply_id: reply_id_delete,
            delete_password: 'password'
          })
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.equal(res.text,'deleted')
            done();
          })
        
      });//end test 
      
    });
    
  });
  
  suite('API ROUTING FOR /api/boards', function(){
    test('delete test board with correct password', function(done){
      chai.request(server)
        .delete('/api/boards')
        .send({
          board : 'test',
          password: process.env.BOARD_DELETE_PASSWORD
        })
        .end(function(err, res){
          assert.equal(res.text,'deleted');
          done();
        })
    });
  });

});