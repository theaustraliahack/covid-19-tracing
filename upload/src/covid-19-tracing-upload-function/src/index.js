const {Storage} = require('@google-cloud/storage');
const Token = require('./token');

const locationHistoryBucketName = "covid-19-tracing-location-history";

const storage = new Storage();
const bucket = storage.bucket(locationHistoryBucketName);

const storeData = function(token,data,dataWritten) {
  

  const filename = token + "_" + new Date().toISOString() + ".json";

  const blob = bucket.file(filename.toLowerCase().replace(/[^a-z0-9\._-]/g, '_'));
  const blobStream = blob.createWriteStream({resumable: false});

  blobStream.on('error', err => {
    console.log(err);
  });

  blobStream.on('finish', () => {
    dataWritten();
  });

  blobStream.end(data);
};

exports.uploadLocation = (req, res) => {
  let token = req.query.token;
  res.header("Access-Control-Allow-Origin", "*"); 

  Token.isValid(token).then(function() {
    let locationData = req.body;

    if (locationData.length > 0) {
      storeData(
        token,locationData, function() {
          res.status(200).send(locationData.length+" bytes received, we will process the data and add it to our map. We wish you a speedy recovery.");
        }
      );
    } else {
      res.status(400).send('data invalid');
    }
  }, function() {
    res.status(403).send('sorry');
  });

};