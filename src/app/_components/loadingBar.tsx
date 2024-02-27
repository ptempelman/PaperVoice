
export const LoadingBar = ({ duration }: { duration: number }) => {
    return (
        <div className="w-full mb-4 bg-gray-200 h-4 rounded-md overflow-hidden">
            <div
                className="bg-gray-700 h-full rounded-md"
                style={{
                    width: '0%',
                    animation: `fillUp ${duration}s linear forwards`,
                }}
            />
        </div>
    );
};

