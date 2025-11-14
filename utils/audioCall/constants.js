export const CALL_STATUS = {
	IDLE: 'IDLE',
	WAITING_FOR_PEER: 'WAITING_FOR_PEER',
	READY: 'READY',
	CONNECTING: 'CONNECTING',
	ACTIVE: 'ACTIVE',
	ENDED: 'ENDED',
	FAILED: 'FAILED'
};

export const PAIRING_STATE = {
	IDLE: 'IDLE',
	FINDING: 'FINDING',
	WAITING: 'WAITING',
	MATCHED: 'MATCHED',
	RINGING: 'RINGING',
	CONNECTED: 'CONNECTED',
	ENDED: 'ENDED'
};

export const SOCKET_EVENTS = {
	QUEUE_STATUS: 'queueStatus',
	FILTER_LEVEL_CHANGED: 'filterLevelChanged',
	PAIRING_SUCCESS: 'pairingSuccess',
	PAIR_DISCONNECTED: 'pairDisconnected',
	CALL_READY: 'callReady',
	CALL_ENDED: 'callEnded',
	PARTNER_STATUS: 'partnerCallStatus',
	CALL_NEGOTIATION_NEEDED: 'callNegotiationNeeded',
	RTC_OFFER: 'rtcOffer',
	RTC_ANSWER: 'rtcAnswer',
	RTC_ICE: 'rtcIceCandidate'
};

export const HEARTBEAT_INTERVAL_MS = 8000;
export const CALL_TIMER_INTERVAL_MS = 1000;

export const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:1000';

export const DEFAULT_CALL_DESCRIPTION =
	'We are finding someone who fits your vibe. Hang tight while we secure a call.';

export const QUEUE_DEFAULTS = {
	position: 0,
	waitTime: 0,
	estimatedWait: 0,
	filterLevel: 1,
	filterDescription: 'Searching with your preferences',
	queueSize: 0
};

export const AUDIO_SOUNDS = {
	RINGBACK: '/sounds/standardringtone.mp3',
	CONNECTED: '/sounds/sgs8_call_connect.mp3',
	ENDED: '/sounds/huawei_hang_up_sound.mp3'
};
