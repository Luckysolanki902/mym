import { useCallback, useEffect, useMemo, useRef } from 'react';
import Peer from 'peerjs';
import { useAudioCallContext } from '@/context/AudioCallContext';
import { CALL_STATUS, SOCKET_SERVER_URL } from '@/utils/audioCall/constants';

const buildPeerHostConfig = (callContext) => {
	const explicitHost = process.env.NEXT_PUBLIC_PEER_HOST;
	const explicitPort = process.env.NEXT_PUBLIC_PEER_PORT;
	const explicitSecure = process.env.NEXT_PUBLIC_PEER_SECURE;

	if (explicitHost) {
		return {
			host: explicitHost,
			port: explicitPort ? Number(explicitPort) : undefined,
			secure:
				typeof explicitSecure === 'string'
					? explicitSecure.toLowerCase() === 'true'
					: undefined,
			path: callContext?.peerServerPath || '/peerjs'
		};
	}

	try {
		const fallbackUrl = new URL(SOCKET_SERVER_URL);
		return {
			host: fallbackUrl.hostname,
			port: fallbackUrl.port ? Number(fallbackUrl.port) : undefined,
			secure: fallbackUrl.protocol === 'https:',
			path: callContext?.peerServerPath || '/peerjs'
		};
	} catch (error) {
		return {
			host: undefined,
			port: undefined,
			secure: undefined,
			path: callContext?.peerServerPath || '/peerjs'
		};
	}
};

const DEFAULT_AUDIO_CONSTRAINTS = {
	audio: {
		echoCancellation: true,
		noiseSuppression: true,
		autoGainControl: true
	}
};

export const usePeerConnection = ({ onCallStarted, onCallEnded, onError }) => {
	const {
		state: { callContext, socket, peer, user, localStream },
		dispatch,
		actions
	} = useAudioCallContext();

	const callRef = useRef(null);

	const updateCallStatus = useCallback(
		(status) => {
			dispatch({ type: actions.SET_CALL_STATUS, payload: status });
			if (socket && user?.mid) {
				socket.emit('callStatusUpdate', {
					userMID: user.mid,
					status
				});
			}
		},
		[actions.SET_CALL_STATUS, dispatch, socket, user?.mid]
	);

	const ensureLocalStream = useCallback(async () => {
		if (localStream) {
			return localStream;
		}

		if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
			throw new Error('Microphone access is unavailable in this browser.');
		}

		const stream = await navigator.mediaDevices.getUserMedia(DEFAULT_AUDIO_CONSTRAINTS);
		dispatch({ type: actions.SET_LOCAL_STREAM, payload: stream });
		return stream;
	}, [actions.SET_LOCAL_STREAM, dispatch, localStream]);

	const cleanupCall = useCallback(
		(reason) => {
			callRef.current?.close();
			callRef.current = null;
				dispatch({ type: actions.SET_REMOTE_STREAM, payload: null });
			updateCallStatus(CALL_STATUS.ENDED);
			if (onCallEnded) {
				onCallEnded(reason);
			}
		},
			[actions.SET_REMOTE_STREAM, dispatch, onCallEnded, updateCallStatus]
	);

	const handlePeerCall = useCallback(
		async (call) => {
			try {
				const stream = await ensureLocalStream();
				call.answer(stream);
				callRef.current = call;
				updateCallStatus(CALL_STATUS.CONNECTING);

				call.on('stream', (remoteStream) => {
					dispatch({ type: actions.SET_REMOTE_STREAM, payload: remoteStream });
					updateCallStatus(CALL_STATUS.ACTIVE);
					onCallStarted?.();
				});

				call.on('close', () => cleanupCall('peer-closed'));
				call.on('error', (error) => {
					cleanupCall('peer-error');
					onError?.(error);
				});
			} catch (error) {
				updateCallStatus(CALL_STATUS.FAILED);
				onError?.(error);
			}
		},
		[actions.SET_REMOTE_STREAM, cleanupCall, ensureLocalStream, onCallStarted, onError, updateCallStatus]
	);

	useEffect(() => {
			if (!callContext || peer) {
			return undefined;
		}

		const hostConfig = buildPeerHostConfig(callContext);
		const peerOptions = {
			debug: 1,
			host: hostConfig.host,
			port: hostConfig.port,
			secure: hostConfig.secure,
			path: hostConfig.path,
			config: callContext.iceConfig
		};

		const newPeer = new Peer(undefined, peerOptions);
		dispatch({ type: actions.SET_PEER, payload: newPeer });

		newPeer.on('open', (id) => {
			if (socket && user?.mid) {
				socket.emit('registerPeer', {
					userMID: user.mid,
					peerId: id
				});
			}
		});

		newPeer.on('call', handlePeerCall);
		newPeer.on('error', (error) => {
			onError?.(error);
			dispatch({ type: actions.SET_ERROR, payload: error.message });
		});

			return () => {
			newPeer.off('call', handlePeerCall);
			newPeer.destroy();
			dispatch({ type: actions.SET_PEER, payload: null });
		};
	}, [actions.SET_ERROR, actions.SET_PEER, callContext, dispatch, handlePeerCall, onError, peer, socket, user?.mid]);

	const initiateCall = useCallback(
		async (partnerPeerId) => {
			if (!peer || !partnerPeerId) {
				throw new Error('Peer connection not ready.');
			}

			const stream = await ensureLocalStream();
			const call = peer.call(partnerPeerId, stream);
			if (!call) {
				throw new Error('Unable to start the call.');
			}

			callRef.current = call;
			updateCallStatus(CALL_STATUS.CONNECTING);

			call.on('stream', (remoteStream) => {
				dispatch({ type: actions.SET_REMOTE_STREAM, payload: remoteStream });
				updateCallStatus(CALL_STATUS.ACTIVE);
				onCallStarted?.();
			});

			call.on('close', () => cleanupCall('peer-closed'));
			call.on('error', (error) => {
				cleanupCall('peer-error');
				onError?.(error);
			});
		},
		[actions.SET_REMOTE_STREAM, cleanupCall, ensureLocalStream, onCallStarted, onError, peer, updateCallStatus]
	);

	const hangUp = useCallback(
		(reason = 'manual-end') => {
			callRef.current?.close();
			if (socket && user?.mid) {
				socket.emit('endCall', {
					userMID: user.mid,
					reason
				});
			}
			cleanupCall(reason);
		},
		[cleanupCall, socket, user?.mid]
	);

	useEffect(() => () => hangUp('unmount'), [hangUp]);

	const localTracks = useMemo(() => localStream?.getTracks() || [], [localStream]);

	const setMuted = useCallback(
		(shouldMute) => {
			localTracks.forEach((track) => {
				if (track.kind === 'audio') {
					track.enabled = !shouldMute;
				}
			});
			dispatch({ type: actions.SET_MUTED, payload: shouldMute });
		},
		[actions.SET_MUTED, dispatch, localTracks]
	);

	return {
		peer,
		initiateCall,
		hangUp,
		setMuted,
		ensureLocalStream
	};
};
