function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function randomUserId() {
  const len = 3;
  let res = "";
  for (let i = 0; i < len; ++i) {
    res += String.fromCharCode(
      "a".charCodeAt(0) + Math.floor(Math.random() * 26)
    );
  }
  return res;
}

var conference;
var room = "64a62de65b56814817cb3669";
var localStream;
var publication;
var mixedStream;

function runSocketIOSample() {
  conference = new Owt.Conference.ConferenceClient();

  createToken(room, randomUserId(), "presenter", function (token) {
    conference.join(token).then((confInfo) => {
      id = confInfo.self.id;

      pubAndMixMic();
      pubAndMixScreen();

      const remoteStreams = confInfo.remoteStreams;
      for (const stream of remoteStreams) {
        if (
          stream.source.audio === "mixed" ||
          stream.source.video === "mixed"
        ) {
          mixedStream = stream;
          renderMixedStream(mixedStream);
        }
      }
    });
  });
}

window.onbeforeunload = function () {
  conference && conference.leave();
  publication && publication.stop();
};

function pubAndMixScreen() {
  const videoConstraintsForScreencast = new Owt.Base.VideoTrackConstraints(
    Owt.Base.VideoSourceInfo.SCREENCAST
  );
  videoConstraintsForScreencast.resolution = {
    width: 1920,
    height: 1080,
  };
  videoConstraintsForScreencast.frameRate = 30;

  Owt.Base.MediaStreamFactory.createMediaStream(
    new Owt.Base.StreamConstraints(undefined, videoConstraintsForScreencast)
  ).then(
    (mediaStream) => {
      localStream = new Owt.Base.LocalStream(
        mediaStream,
        new Owt.Base.StreamSourceInfo(
          undefined,
          Owt.Base.VideoSourceInfo.SCREENCAST
        )
      );

      conference
        .publish(localStream, {
          video: [
            {
              codec: { name: "vp8" },
            },
          ],
        })
        .then((pub) => {
          publication = pub;
          mixStream(room, publication.id, "common");
        });
    },
    (err) => {
      console.error("[createMediaStream]", err);
    }
  );
}

function pubAndMixMic() {
  const audioConstraintsForMic = new Owt.Base.AudioTrackConstraints(
    Owt.Base.AudioSourceInfo.MIC
  );
  Owt.Base.MediaStreamFactory.createMediaStream(
    new Owt.Base.StreamConstraints(audioConstraintsForMic, undefined)
  ).then((mediaStream) => {
    const audioStream = new Owt.Base.LocalStream(
      mediaStream,
      new Owt.Base.StreamSourceInfo(Owt.Base.AudioSourceInfo.MIC, undefined)
    );

    conference.publish(audioStream).then((pub) => {
      mixStream(room, pub.id, "common");
    });
  });
}

function renderMixedStream(stream) {
  if (!conference) {
    return;
  }
  conference
    .subscribe(stream, {
      audio: true,
      video: {
        codecs: [{ name: "vp8" }],
      },
    })
    .then((subscription) => {
      $(".mixed-stream").get(0).srcObject = stream.mediaStream;
    });
}
