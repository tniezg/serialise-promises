var serialisePromises = require('./index');

var sinon = require('sinon');
var chai = require('chai');

var Q = require('q');

chai.should();

describe('serialisePromises', function(){
  it('should throw error when no promise creator provided', function(){
    (function(){
      serialisePromises({
        repeats: 3
      });
    }).should.throw(Error);

    (function(){
      serialisePromises({
        promiseCreator: function(){},
        repeats: 3
      });
    }).should.not.throw(Error);

    (function(){
      serialisePromises({
        promiseCreator: function(){},
        creatorArguments: ['a', 'b', 'c']
      });
    }).should.not.throw(Error);
  });

  it('should use creator arguments for the number of promises and arguments, even when repeats provided', function(cb){
    var promise = sinon.spy();

    serialisePromises({
      promiseCreator: promise,
      repeats: 15,
      creatorArguments: ['1', '2']
    }).then(function(){
      promise.callCount.should.be.equal(2);
      cb();
    });
  });

  it('should provide consecutive arguments to promise creator', function(cb){
    var inputs = ['a', 'b', 'c'];

    serialisePromises({
      promiseCreator: function(input){
        input.should.equal(inputs.shift());
      },
      creatorArguments: inputs.slice()
    }).then(function(){
      inputs.should.be.empty;
      cb();
    });
  });

  it('should use repeats when no creator arguments provided and repeat a set number of times', function(cb){
    var promise = sinon.spy();

    serialisePromises({
      promiseCreator: promise,
      repeats: 15
    }).then(function(){
      promise.callCount.should.be.equal(15);
      cb();
    });
  });

  it('should reject correctly if any promise fails with an exception', function(cb){
    serialisePromises({
      promiseCreator: function(input){

        if(input === 1){
          throw new Error(2);
        }
      },
      creatorArguments: [1, 2, 3]
    }).then(null, function(){
      cb();
    });
  });

  it('should reject correctly if any promise fails with a rejection', function(cb){
    serialisePromises({
      promiseCreator: function(input){

        if(input === 2){
          return Q.reject('abc');
        }
      },
      creatorArguments: [1, 2, 3]
    }).then(null, function(error){
      error.should.be.equal('abc');
      cb();
    });
  });

  it('should throw error when neither args provided nor number of repeats', function(){
    (function check(){
      serialisePromises({
        promiseCreator: function(){}
      });
    }).should.throw(Error);
  });

  it('should spread arguments provided', function(cb){
    serialisePromises({
      promiseCreator: function(a, b, c){
        a.should.be.equal('a');
        b.should.be.equal('b');
        c.should.be.equal('c');
      },
      creatorArguments: [['a', 'b', 'c'], ['a', 'b', 'c']]
    }).then(cb);
  });
});