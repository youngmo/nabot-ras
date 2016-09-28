var fs = require('fs');
var request = require('request');
var awsIot = require('aws-iot-device-sdk');
var RaspiCam = require("raspicam");

var device = awsIot.device({
  keyPath: "./47a9839906-private.pem.key",
  certPath: "./47a9839906-certificate.pem.crt",
  caPath: "./root-CA.crt",
  clientId: "Tsubakiya_anras",
  region: "us-east-1"
});

var raspicamOpt = {
  mode:"photo",
  output:"/home/pi/aws-iot/" + Date.now() + ".jpg"
};

device
  .on('connect', function() {
    console.log('connect:subscribe:photo/send');
    device.subscribe('photo/send');
  });

device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());

    var camera = new RaspiCam(raspicamOpt);
    var sendFileName;

    camera.start( );

    camera.on("start", function(){
      console.log("start");
    });

    camera.on("read", function(err, timestamp, filename){
      console.log("read");
      sendFileName = filename;
    });

    camera.on("stop", function(){
      console.log("stop");
    });

    camera.on("exit", function(){
      console.log("exit");
      camera.stop( );

      var formData = {
        name: 'file',
        filename: sendFileName,
        file: fs.createReadStream(__dirname + '/' + sendFileName)
      };

      request.post({url:'https://slack.com/api/files.upload?token=xoxp-70210791030-70210791190-78428373924-7ebd764042&channels=C226JJQQH&pretty=1', formData: formData}, function optionalCallback(err, httpResponse, body) {
        if (err) {
          return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
      });
    });
  });

