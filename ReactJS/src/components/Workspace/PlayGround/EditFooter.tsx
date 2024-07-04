import React from "react";

type EditorFooterProps = {
	handleSubmit: () => void;
	isLoading: boolean;
	problemId: string;
	user: any;
};

const EditorFooter: React.FC<EditorFooterProps> = ({ handleSubmit, isLoading, problemId, user }) => {
	return (
		<div className='flex bg-dark-layer-1 absolute bottom-0 z-10 w-full'>
			<div className='mx-5 my-[10px] flex justify-between w-full'>
				<div className='ml-auto flex items-center space-x-4'>
					{user && (
						<a
							href={`/submissions/${problemId}`}
							className='px-3 py-1.5 text-sm font-medium items-center whitespace-nowrap transition-all focus:outline-none inline-flex bg-dark-fill-3  hover:bg-dark-fill-2 text-dark-label-2 rounded-lg'
						>
							Your submissions
						</a>
					)}
					<button
						className='px-3 py-1.5 font-medium items-center transition-all focus:outline-none inline-flex text-sm text-white bg-dark-green-s hover:bg-green-3 rounded-lg'
						onClick={handleSubmit}
						disabled={isLoading} // Ngăn chặn click khi isLoading là true
						style={{ // Điều chỉnh opacity khi isLoading là true
							opacity: isLoading ? 0.8 : 1,
							pointerEvents: isLoading ? 'none' : 'auto',
						}}
					>
						{isLoading ? "Running..." : "Submit"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditorFooter;
