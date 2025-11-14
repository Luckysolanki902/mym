import { io } from 'socket.io-client';
import { SOCKET_SERVER_URL } from './constants';

export const createAudioSocket = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	return io(SOCKET_SERVER_URL, {
		query: { pageType: 'audiocall' },
		transports: ['websocket', 'polling'],
		reconnectionAttempts: 5,
		reconnectionDelay: 500
	});
};
