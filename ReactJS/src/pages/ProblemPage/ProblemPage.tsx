import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../../firebase/firebase';
import Topbar from '../../components/Topbar/Topbar';
import Workspace from '../../components/Workspace/Workspace';

type ProblemPageProps = {
    user: any;
};

const ProblemPage: React.FC<ProblemPageProps> = ({ user }) => {
    if (user && user.banned) {
        return (
            <>
                <main className="min-h-screen">
                    <Topbar user={user} />
                    <h1
                        className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium
              uppercase mt-10 mb-5'
                    >
                        Your account is banned
                    </h1>
                </main>
            </>
        )
    }
    const { problemId } = useParams<{ problemId: string }>();
    const { problem, loading, error } = useProblem(problemId);
    if (loading) {
        return;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!problem) {
        return <div>No problem found</div>;
    }
    return (
        <>
            <Topbar user={user} />
            <Workspace problem={problem} user={user} />
        </>
    );
}
export default ProblemPage;

const useProblem = (problemId: string | undefined) => {
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