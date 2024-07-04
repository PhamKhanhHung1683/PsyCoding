import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { BsCheck2Circle } from 'react-icons/bs';
import { firestore } from '../../../firebase/firebase';

type ProblemDescriptionProps = {
    problem: any,
    user: any,
    _solved: any
};

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem, user, _solved }) => {
    const problemDifficultyClass = problem.difficulty === "Easy" ? "bg-olive text-olive" : problem.difficulty === "Medium" ? "bg-dark-yellow text-dark-yellow" : " bg-dark-pink text-dark-pink"
    const { solved } = useGetSolvedOnProblem(problem, user);
    return (
        <div className='bg-dark-layer-1'>
            {/* TAB */}
            <div className='flex h-11 w-full items-center pt-2 bg-dark-layer-2 text-white overflow-x-hidden'>
                <div className={"bg-dark-layer-1 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer"}>
                    Description
                </div>
            </div>
            <div className='flex px-0 py-4 h-[calc(100vh-94px)] overflow-y-auto'>
                <div className='px-5'>
                    {/* Problem heading */}
                    <div className='w-full'>
                        <div className='flex space-x-4'>
                            <div className='flex-1 mr-2 text-lg text-white font-medium'>{problem.title}</div>
                        </div>

                        <div className='flex items-center mt-3'>
                            <div
                                className={`${problemDifficultyClass} inline-block rounded-[21px] bg-opacity-[.15] px-2.5 py-1 text-xs font-medium capitalize`}
                            >
                                {problem.difficulty}
                            </div>
                            {(solved || _solved) && (
                                <div className='rounded p-[3px] ml-4 text-lg transition-colors duration-200 text-green-s text-dark-green-s'>
                                    <BsCheck2Circle />
                                </div>
                            )}
                        </div>

                        {/* Problem Statement(paragraphs) */}
                        <div className='text-white text-sm mt-3'>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{problem.description}</div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
export default ProblemDescription;

function useGetSolvedOnProblem(problem: any, user: any) {
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        const getSolvedOnProblem = async () => {
            const userRef = doc(firestore, "users", user!.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                const { solvedProblems } = data;
                setSolved(
                    solvedProblems.includes(problem.problemId),
                );
            }
        };
        if (user) getSolvedOnProblem();
        return () => setSolved(false);
    }, [problem, user]);
    return { solved };
}