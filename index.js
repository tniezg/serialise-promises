'use strict';

var extend = require('extend');
var Q = require('q');

/**
 * Unlike examples on the internet, this function does not require a promise.
 * Instead, it creates a new series of promises and attaching is left to the
 * person using the library.
 */
function serialisePromises(customOptions){
// args, promiseCreateFunction
  var defaults = {
    promiseCreator: null, 
    repeats: null,
    creatorArguments: null
  };
  var options = extend({}, defaults, customOptions);
  var creatorArguments;
  var chain;
  var promiseCreator;
  var promiseIndex;
  var repeats;
  var collectedResults;

  promiseCreator = options.promiseCreator;

  // Treat creatorArguments as more important than repeats if both are defined.
  if(typeof promiseCreator !== 'function'){
    throw new Error('promiseCreator is required and needs to be a function');
  }else{

    if(Array.isArray(options.creatorArguments)){
      creatorArguments = options.creatorArguments;

      if(!creatorArguments.length){
        return Q.resolve([]);
      }else{
        collectedResults = [];
        chain = Q.fcall.apply(null, [promiseCreator].concat(creatorArguments[0]));

        for(promiseIndex = 1; promiseIndex < creatorArguments.length; promiseIndex++){
          chain = chain.then((function(creatorArgument){
            return function(){
              collectedResults = collectedResults.concat(
                Array.prototype.slice.call(arguments));
              return Q.fcall.apply(null, [promiseCreator].concat(creatorArgument));
            };
          })(creatorArguments[promiseIndex]));
        }

        return chain.then(function(){
          collectedResults = collectedResults.concat(
            Array.prototype.slice.call(arguments));

          return Q.resolve(collectedResults);
        });
      }
    }else if(typeof options.repeats === 'number'){
      repeats = options.repeats;

      if(repeats < 2){
        return Q.resolve([]);
      }else{
        collectedResults = [];
        chain = Q.fcall(promiseCreator);

        for(promiseIndex = 2; promiseIndex <= repeats; promiseIndex++){
          chain = chain.then(function(){
            collectedResults = collectedResults.concat(Array.prototype.slice.call(arguments));
            return Q.fcall(promiseCreator);
          });
        }

        return chain.then(function(){
          collectedResults = collectedResults.concat(Array.prototype.slice.call(arguments));
          return Q.resolve(collectedResults);
        });
      }
    }else{
      throw new Error('provide either creatorArguments (array) or repeats (number)');
    }
  }



  if(imageUrls.length){
    imagesInformationArray = [];
    // quite a bit of work with #reduce(), though a cool function, think of optimising :)
    chain = imageUrls.slice(1).reduce(function(previous, currentImageUrl){
      return previous.then(function(previousImageInformation){
        imagesInformationArray.push(previousImageInformation);

        return downloadImageSize(currentImageUrl);
      });
    }, downloadImageSize(imageUrls[0]));

    return chain.then(function(previousImageInformation){
        imagesInformationArray.push(previousImageInformation);
      });
  }else{
    return [];
  }
}

module.exports = serialisePromises;