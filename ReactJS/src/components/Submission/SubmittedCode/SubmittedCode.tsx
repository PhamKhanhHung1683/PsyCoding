import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';

type SubmittedCodeProps = {
    submission: any
};

const SubmittedCode: React.FC<SubmittedCodeProps> = ({ submission }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(submission.code)
            .then(() => {
                toast.success('Code copied to clipboard!', {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            })
            .catch((err) => {
                toast.error('Failed to copy code.', {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                console.error('Failed to copy: ', err);
            });
    };
    return (
        <div className='flex flex-col bg-dark-layer-1 relative'>
            <div className='flex items-center justify-between bg-dark-layer-2 h-11 w-full'>
                <button className='flex cursor-pointer items-center rounded text-left focus:outline-none bg-dark-fill-3 text-dark-label-2
                    hover:bg-dark-fill-2 px-2 py-1.5 font-medium'>
                    <div className='flex items-center px-1'>
                        <div className='text-xs text-label-2 dark:text-dark-label-2'>C++ 17</div>
                    </div>
                </button>
                <button
                    className="mr-2 flex items-center bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 focus:outline-none"
                    onClick={handleCopy}
                >
                    <FaCopy className="mr-1" />
                </button>
            </div>

            <div className='w-full px-5 overflow-auto'>
                <CodeMirror
                    value={submission.code}
                    theme={vscodeDark}
                    extensions={[cpp()]}
                    style={{ fontSize: 16 }}
                    readOnly={true}
                />
            </div>
        </div>
    );
}
export default SubmittedCode;