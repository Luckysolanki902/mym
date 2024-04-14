import { CircularProgress } from '@mui/material';

export default function PageRefresh() {
  const { isReady, reload } = useRouter();

  const { isRefreshing, pullPosition } = usePullToRefresh({
    onRefresh: reload,
    maximumPullLength: MAXIMUM_PULL_LENGTH,
    refreshThreshold: REFRESH_THRESHOLD,
    isDisabled: !isReady,
  });

  return (
    <div
      style={{
        top: (isRefreshing ? REFRESH_THRESHOLD : pullPosition) / 3,
        opacity: isRefreshing || pullPosition > 0 ? 1 : 0,
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        height: '8px',
        width: '8px',
        borderRadius: '50%',
        padding: '2px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        className={`h-full w-full ${isRefreshing ? 'animate-spin' : ''}`}
        style={!isRefreshing ? { transform: `rotate(${pullPosition}deg)` } : {}}
      >
        {/* Material-UI CircularProgress */}
        <CircularProgress size={24} thickness={4} color="primary" />
      </div>
    </div>
  );
}
