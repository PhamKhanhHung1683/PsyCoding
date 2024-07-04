import React, { useEffect, useState } from 'react';
import Split from 'react-split';
import SubmissionDetails from './SubmissionDetails/SubmissionDetails';
import SubmittedCode from './SubmittedCode/SubmittedCode';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';

type SubmissionProps = {
    submission: any,
};

const Submission:React.FC<SubmissionProps> = ({ submission }) => {
    const { problem, loading, error } = useGetProblem(submission.problemId);
    if(loading) return null;
    if (error) return <div>{error}</div> 
    return (
        <Split className='split h-screen'>
            <SubmissionDetails submission={submission} problem={problem}/>
            <SubmittedCode submission={submission}/>
        </Split>
    )
}
export default Submission;

const useGetProblem = (problemId: string | undefined) => {
    const [problem, setProblem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProblem = async () => {
            if (!problemId) return;
            try {
                const docRef = doc(firestore, "problems", problemId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProblem(docSnap.data());
                } else {
                    setError("No such document!");
                }
            } catch (err) {
                setError("Failed to fetch problem");
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
        return () => {
            // Cleanup function if needed
        };
    }, [problemId]);

    return { problem, loading, error };
};