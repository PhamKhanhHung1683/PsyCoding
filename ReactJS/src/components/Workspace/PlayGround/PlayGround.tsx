import React, { useState } from 'react';
import PreferenceNav from './PreferenceNav';
import Split from 'react-split';
import EditorFooter from './EditFooter';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { firestore } from '../../../firebase/firebase';
import { toast } from 'react-toastify';
import { addDoc, arrayUnion, collection, doc, updateDoc } from 'firebase/firestore';

type PlayGroundProps = {
    problem: any,
    user: any,
    setSolved: React.Dispatch<React.SetStateAction<boolean>>
};

const PlayGround: React.FC<PlayGroundProps> = ({ problem, user, setSolved }) => {
    const [isLoading, setIsLoading] = useState(false);
    let [userCode, setUserCode] = useState<string>('//C++ \n#include <bits/stdc++.h>\n\nint main(){ \n\n}');
    const onChange = (value: string) => {
        setUserCode(value);
    }
    const handleSubmit = async () => {
        if (!user) {
            toast.warn("Please login to submit your code.", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }
        setIsLoading(true);

        const resultsArray: any[] = [];
        let passedCount = 0;
        let hasSyntaxError = false;
        let totalCpuTime = 0;
        let totalMemory = 0;
        let firstFailedTestCase: any = null;
        let syntaxError = '';

        for (const testCase of problem.testCases) {
            try {
                const sanitizedInput = testCase.input.replace(/\n/g, ' ');
                const response = await fetch('https://psy-coding-nodejs.vercel.app/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        script: userCode,
                        language: 'cpp17',
                        stdin: sanitizedInput,
                    }),
                });

                const data = await response.json();
                if (data.statusCode === 500 || data.statusCode === 410) {
                    toast.error("Server error. Please try again later.", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    console.error("Server error:", data);
                    setIsLoading(false);
                    return;
                } else if (data.statusCode === 429) {
                    toast.error("Daily limit reached. Please try again tomorrow.", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    setIsLoading(false);
                    return;
                } else if (data.statusCode === 400) {
                    toast.error("Invalid request. Please check your code and input.", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    console.error("Invalid request:", data);
                    setIsLoading(false);
                    return;
                } else if (data.statusCode === 401) {
                    toast.error("Unauthorized request. Please check your credentials.", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    console.error("Unauthorized request:", data);
                    setIsLoading(false);
                    return;
                }
                else {
                    if (data.output.startsWith("\njdoodle.cpp")) {
                        hasSyntaxError = true;
                        syntaxError = data.output;
                        console.log(data.output)
                        toast.warn('Syntax error!'
                            , {
                                position: "top-center",
                                autoClose: 5000,
                                hideProgressBar: true,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: "dark",
                            });
                        break;
                    }
                    const passed = data.output.trim() === testCase.expectedOutput.trim();
                    if (passed) {
                        passedCount++;  // Tăng số test case đúng
                    } else if (!firstFailedTestCase) {
                        firstFailedTestCase = {
                            input: testCase.input,
                            expectedOutput: testCase.expectedOutput,
                            actualOutput: data.output
                        };
                    }
                    totalCpuTime += parseFloat(data.cpuTime) || 0;
                    totalMemory += parseFloat(data.memory) || 0;
                    resultsArray.push({
                        input: testCase.input,
                        expectedOutput: testCase.expectedOutput,
                        output: data.output, error: null,
                        passed,
                        memory: data.memory,
                        cpuTime: data.cpuTime
                    });
                }
            } catch (error) {
                console.log(error);
                resultsArray.push({
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    output: null,
                    error: error,
                    memory: null,
                    cpuTime: null
                });
            }
        }

        try {
            const submission = {
                userId: user.userId,
                problemId: problem.problemId,
                code: userCode,
                passedCount: passedCount,
                totalCount: problem.testCases.length,
                createdAt: new Date(),
                firstFailedTestCase: firstFailedTestCase,
                totalCpuTime: totalCpuTime,
                totalMemory: totalMemory,
                syntaxError: hasSyntaxError ? syntaxError : ''
            };
            await addDoc(collection(firestore, 'submissions'), submission);
            toast.success("Submission saved successfully.", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } catch (error) {
            toast.error(`Error saving submission: ${error}`, {
                position: "bottom-left",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }

        setIsLoading(false);

        if (!hasSyntaxError) {
            if (passedCount === problem.testCases.length) {
                const userRef = doc(firestore, 'users', user.userId);
                // Thêm problemId vào mảng solvedProblem của người dùng
                await updateDoc(userRef, {
                    solvedProblems: arrayUnion(problem.problemId)
                });
                setSolved(true);
                toast.success("Congratulation! You passed all test cases.", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } else if (firstFailedTestCase) {
                toast.info(
                    <>
                        You passed {passedCount}/{problem.testCases.length} testcases
                    </>
                    , {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
            }
        }
    }

    return (
        <div className='flex flex-col bg-dark-layer-1 relative'>
            <PreferenceNav />

            <Split className='h-[calc(100vh-94px)]' direction='vertical' sizes={[60, 40]} minSize={60} >
                <div className='w-full px-5 overflow-auto'>
                    <CodeMirror
                        value={userCode}
                        theme={vscodeDark}
                        extensions={[cpp()]}
                        style={{ fontSize: 16 }}
                        onChange={onChange}
                    />
                </div>
                <div className='w-full px-5 overflow-auto'>
                    {/* testcase heading */}
                    <div className='flex h-10 items-center space-x-6'>
                        <div className='relative flex h-full flex-col justify-center'>
                            <div className='text-sm font-medium leading-5 text-white'>Sample test case</div>
                            <hr className='absolute bottom-0 h-0.5 w-full rounded-full border-none bg-white' />
                        </div>
                    </div>
                    <div className='font-semibold my-4'>
                        <p className='text-sm font-medium mt-4 text-white'>Input:</p>
                        <div className='w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2' style={{ whiteSpace: 'pre-wrap' }}>
                            {problem.testCases[0].input}
                        </div>
                        <p className='text-sm font-medium mt-4 text-white'>Output:</p>
                        <div className='w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2' style={{ whiteSpace: 'pre-wrap' }}>
                            {problem.testCases[0].expectedOutput}
                        </div>
                    </div>
                </div>

            </Split>
            <EditorFooter handleSubmit={handleSubmit} isLoading={isLoading} problemId={problem.problemId} user={user} />
        </div>
    );
}
export default PlayGround;