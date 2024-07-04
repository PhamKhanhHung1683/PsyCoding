import React from 'react';
import { BsCheck2Circle } from 'react-icons/bs';

type SubmissionDetailsProps = {
    submission: any,
    problem: any,
};

const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({ submission, problem }) => {
    const problemDifficultyClass = problem?.difficulty === "Easy" ? "bg-olive text-olive" : problem?.difficulty === "Medium" ? "bg-dark-yellow text-dark-yellow" : " bg-dark-pink text-dark-pink";
    const passedAllTests = submission.passedCount === submission.totalCount;
    return (
        <div className='bg-dark-layer-1'>
            {/* TAB */}
            <div className='flex h-11 w-full items-center pt-2 bg-dark-layer-2 text-white overflow-x-hidden'>
                <div className={"bg-dark-layer-1 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer"}>
                    Submission Details
                </div>
            </div>
            <div className='flex px-0 py-4 h-[calc(100vh-94px)] overflow-y-auto'>
                <div className='px-5'>
                    {/* heading */}
                    <div className='w-full'>
                        <div className='flex space-x-4'>
                            <div className='flex-1 mr-2 text-lg text-white font-medium'>{problem?.title}</div>
                        </div>

                        <div className='flex items-center mt-3'>
                            <div
                                className={`${problemDifficultyClass} inline-block rounded-[21px] bg-opacity-[.15] px-2.5 py-1 text-xs font-medium capitalize`}
                            >
                                {problem.difficulty}
                            </div>

                            <div className='rounded p-[3px] ml-4 text-lg transition-colors duration-200 text-green-s text-dark-green-s'>
                                {passedAllTests && <BsCheck2Circle />}
                            </div>
                        </div>

                        {/* submission details */}
                        <div className='text-white text-sm mt-3'>
                            {submission.syntaxError ? (
                                <div className='mb-2'>
                                    <strong>Syntax Error:</strong>
                                    <pre className='mt-2 bg-dark-layer-2 p-2 rounded whitespace-pre-wrap'>{submission.syntaxError}</pre>
                                </div>
                            ) : (
                                <>
                                    <div className='mb-2'>
                                        <strong>Submission Date:</strong> {new Date(submission.createdAt.seconds * 1000).toLocaleString()}
                                    </div>
                                    <div className='mb-2'>
                                        <strong>Passed Test Cases:</strong> {submission.passedCount} / {submission.totalCount}
                                    </div>
                                    {submission.firstFailedTestCase && (
                                        <div className='mb-2'>
                                            <strong>First Failed Test Case:</strong>
                                            <div className='mt-2 ml-2 mb-2'><strong>Input</strong> <pre className='bg-dark-layer-2 p-2 rounded mt-1'>{submission.firstFailedTestCase.input}</pre></div>
                                            <div className='ml-2 mb-2'><strong>Expected output</strong> <pre className='bg-dark-layer-2 p-2 rounded mt-1'>{submission.firstFailedTestCase.expectedOutput}</pre></div>
                                            <div className='ml-2 mb-2'><strong>Actual output</strong> <pre className='bg-dark-layer-2 p-2 rounded mt-1'>{submission.firstFailedTestCase.actualOutput}</pre></div>
                                        </div>
                                    )}
                                    <div className='mb-2'>
                                        <strong>Total CPU Time:</strong> {submission.totalCpuTime} ms
                                    </div>
                                    <div className='mb-2'>
                                        <strong>Total Memory:</strong> {submission.totalMemory} KB
                                    </div>
                                </>
                            )}
                            <div className='mb-2'>
                                <strong>Problem description:</strong>
                                <div className='mt-1' style={{ whiteSpace: 'pre-wrap' }}>{problem?.description}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubmissionDetails;
