const VideoConferenceView = ({ videos }) => {
  return (
    <div>
      {videos.map((video) => (
        <div key={video.socketId} className="w-[500px] bg-green-500">
          <video
            data-socket={video.socketId}
            ref={(ref) => {
              if (ref && video.stream) {
                ref.srcObject = video.stream;
              }
            }}
            autoPlay
          ></video>
        </div>
      ))}
    </div>
  );
};

export default VideoConferenceView;
