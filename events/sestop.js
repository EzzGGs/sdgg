client.on('voiceStateUpdate', (oldState, newState) => {
    require('./sestop').trackVoiceState(oldState, newState);
});
