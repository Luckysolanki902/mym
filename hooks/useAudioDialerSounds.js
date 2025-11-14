import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Howl } from 'howler';
import { useAudioCallContext } from '@/context/AudioCallContext';
import { AUDIO_SOUNDS } from '@/utils/audioCall/constants';

const buildLoopingHowl = (src) =>
	new Howl({
		src: [src],
		loop: true,
		volume: 0.5
	});

const buildOneShotHowl = (src) =>
	new Howl({
		src: [src],
		loop: false,
		volume: 0.6
	});

export const useAudioDialerSounds = () => {
	const {
		state: { soundsEnabled },
		dispatch,
		actions
	} = useAudioCallContext();

	const ringbackRef = useRef(null);
	const connectedRef = useRef(null);
	const endedRef = useRef(null);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		ringbackRef.current = buildLoopingHowl(AUDIO_SOUNDS.RINGBACK);
		connectedRef.current = buildOneShotHowl(AUDIO_SOUNDS.CONNECTED);
		endedRef.current = buildOneShotHowl(AUDIO_SOUNDS.ENDED);

		return () => {
			ringbackRef.current?.unload();
			connectedRef.current?.unload();
			endedRef.current?.unload();
		};
	}, []);

	const stopAll = useCallback(() => {
		ringbackRef.current?.stop();
		connectedRef.current?.stop();
		endedRef.current?.stop();
	}, []);

	const playRingback = useCallback(() => {
		if (!soundsEnabled) return;
		ringbackRef.current?.play();
	}, [soundsEnabled]);

	const stopRingback = useCallback(() => {
		ringbackRef.current?.stop();
	}, []);

	const playConnected = useCallback(() => {
		if (!soundsEnabled) return;
		connectedRef.current?.play();
	}, [soundsEnabled]);

	const playEnded = useCallback(() => {
		if (!soundsEnabled) return;
		endedRef.current?.play();
	}, [soundsEnabled]);

	const setSoundsEnabled = useCallback(
		(value) => {
			dispatch({ type: actions.SET_SOUNDS, payload: value });
			if (!value) {
				stopAll();
			}
		},
		[actions.SET_SOUNDS, dispatch, stopAll]
	);

	useEffect(() => {
		if (!soundsEnabled) {
			stopAll();
		}
	}, [soundsEnabled, stopAll]);

	return useMemo(
		() => ({
			playRingback,
			stopRingback,
			playConnected,
			playEnded,
			soundsEnabled,
			setSoundsEnabled
		}),
		[playRingback, stopRingback, playConnected, playEnded, soundsEnabled, setSoundsEnabled]
	);
};
