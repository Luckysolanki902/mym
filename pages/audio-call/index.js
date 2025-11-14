import React from 'react';
import { getSession } from 'next-auth/react';
import CustomHead from '@/components/seo/CustomHead';
import AudioCallWrapper from '@/components/fullPageComps/AudioCallWrapper';

const AudioCallPage = ({ userDetails }) => {
	return (
		<>
			<CustomHead
				title="Immersive Audio Calls With Verified College Peers | MyM"
				description="Jump into anonymous high-fidelity audio calls tailored to your preferences. MyM pairs you with peers from your college network for meaningful, low-latency conversations backed by our safety filters."
			/>
			<AudioCallWrapper userDetails={userDetails} />
		</>
	);
};

export async function getServerSideProps(context) {
	const session = await getSession(context);
	const pageurl = process.env.NEXT_PUBLIC_PAGEURL;

	let userDetails = null;
	if (session?.user?.email && pageurl) {
		try {
			const response = await fetch(
				`${pageurl}/api/getdetails/getuserdetails?userEmail=${session.user.email}`
			);
			if (response.ok) {
				userDetails = await response.json();
			}
		} catch (error) {
			console.error('Error fetching user details for audio call:', error);
		}
	}

	return {
		props: {
			userDetails
		}
	};
}

export default AudioCallPage;
