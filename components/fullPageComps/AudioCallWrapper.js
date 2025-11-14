import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useSelector } from 'react-redux';
import { FiltersProvider, useFilters } from '@/context/FiltersContext';
import { AudioCallProvider } from '@/context/AudioCallContext';
import AudioCallDialer from '@/components/audioCall/AudioCallDialer';
import { useAudioCallLifecycle } from '@/hooks/useAudioCallLifecycle';
import UserVerificationDialog from '@/components/chatComps/UserVerificationDialog';
import ExitConfirmationDialog from '@/components/commonComps/ExitConfirmationDialog';
import { Box, Typography } from '@mui/material';

const AudioCallExperience = ({ userDetails }) => {
	const filters = useFilters();
	const lifecycle = useAudioCallLifecycle({
		userDetails,
		filters
	});

	return <AudioCallDialer userDetails={userDetails} lifecycle={lifecycle} />;
};

const AudioCallWrapper = ({ userDetails }) => {
	const { data: session } = useSession();
	const router = useRouter();
	const unverifiedUserDetails = useSelector((state) => state.unverifiedUserDetails);
	const [effectiveUserDetails, setEffectiveUserDetails] = useState(null);
	const [isReady, setIsReady] = useState(false);
	const [exitDialogOpen, setExitDialogOpen] = useState(false);
	const allowNavigationRef = useRef(false);

	useEffect(() => {
		const details =
			userDetails && Object.keys(userDetails).length > 0
				? userDetails
				: unverifiedUserDetails?.mid
				? unverifiedUserDetails
				: null;

		setEffectiveUserDetails(details);
		setIsReady(Boolean(details?.mid));
	}, [session, unverifiedUserDetails, userDetails]);

	useEffect(() => {
		const handleBeforePopState = () => {
			if (!allowNavigationRef.current) {
				setExitDialogOpen(true);
				return false;
			}
			return true;
		};

		router.beforePopState(handleBeforePopState);

		return () => {
			router.beforePopState(() => true);
		};
	}, [router]);

	const handleConfirmExit = () => {
		allowNavigationRef.current = true;
		setExitDialogOpen(false);
		router.back();
	};

	const handleCancelExit = () => {
		allowNavigationRef.current = false;
		setExitDialogOpen(false);
	};

	const userGender = effectiveUserDetails?.gender || 'other';

	return (
		<FiltersProvider>
			<AudioCallProvider>
				<UserVerificationDialog />
				{isReady && effectiveUserDetails ? (
					<AudioCallExperience userDetails={effectiveUserDetails} />
				) : (
					<Box
						display="flex"
						flexDirection="column"
						justifyContent="center"
						alignItems="center"
						height="100vh"
					>
						<Typography variant="body1" fontFamily="Jost" gutterBottom>
							Setting up your audio call experience…
						</Typography>
					</Box>
				)}
				<ExitConfirmationDialog
					open={exitDialogOpen}
					onConfirm={handleConfirmExit}
					onCancel={handleCancelExit}
					userGender={userGender}
				/>
			</AudioCallProvider>
		</FiltersProvider>
	);
};

export default AudioCallWrapper;
