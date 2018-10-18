let express = require("express");
let path = require("path");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
let port = 8080;
const fs = require("fs");

app.use("/", express.static(path.join(__dirname, "dist/FIT2095-Lab11")));
app.use("/audio", express.static(path.join(__dirname, "converted")));

io.on("connection", socket => {
  console.log("new connection made from client with ID=" + socket.id);
  socket.on("newMsg", data => {
    io.sockets.emit("msg", {msg: data.msg, timeStamp: getCurrentDate(), author: data.author});
  });

  socket.on("convert", data => {
    convert(data.msg, socket.id);
  });
});

server.listen(port, () => {
  console.log("Listening on port " + port);
});

function getCurrentDate() {
  let d = new Date();
  return d.toLocaleString();
}


function convert(text, id) {
  const textToSpeech = require("@google-cloud/text-to-speech");
  const client = new textToSpeech.TextToSpeechClient();
  tmp = "";
  for (let i = 0; i < text.length; i++) {
    tmp += text[i].msg + " ";
  }
  const request = {
    input: {text: tmp},
    // Select the language and SSML Voice Gender (optional)
    voice: {languageCode: "en-US", ssmlGender: "NEUTRAL"},
    // Select the type of audio encoding
    audioConfig: {audioEncoding: "MP3"},
  };
// Performs the Text-to-Speech request
  return client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      console.error("ERROR:", err);
      return false;
    }
    // Write the binary audio content to a local file
    fs.writeFile("converted/" + id + ".mp3", response.audioContent, "binary", err => {
      if (err) {
        console.error("ERROR:", err);
        return false;
      }
      console.log("Audio content written to file: " + id + ".mp3");
      io.to(`${id}`).emit("convert", {status: true, id: id});
    });
    return false;
  });
}
