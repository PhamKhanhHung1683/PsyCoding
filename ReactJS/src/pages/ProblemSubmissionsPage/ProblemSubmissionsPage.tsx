import React, { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar/Topbar';
import { Link, useParams } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from '@chakra-ui/react'
import { BsCheck2Circle } from 'react-icons/bs';

type ProblemSubmissionsPageProps = {
    user: any
};

const ProblemSubmissionsPage: React.FC<ProblemSubmissionsPageProps> = ({ user }) => {
    if (!user) return null;
    if (user.role !== 'admin') return null;
    const { problemId } = useParams<{ problemId: string }>();
    const { submissions, loading, error } = useGetSubmissions(problemId);
    const { problem, loadingProblem, errorProblem } = useProblem(problemId);

    if (loading || loadingProblem) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>{error}</div>;
    }

    if (errorProblem) {
        return <div>{errorProblem}</div>;
    }

    if (!submissions) {
        return <div>No submissions found</div>;
    }
    if (!problem) {
        return <div>No problem found</div>;
    }
    
    return (
        <>
            <main className="min-h-screen">
                <Topbar user={user} />
                <h1
                    className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium
                    uppercase mt-10 mb-5'
                >
                    Submissions of problem: <strong>{problem.title}</strong>
                </h1>
                <div className='relative overflow-x-auto mx-auto px-6 pb-10 w-full max-w-[1000px] mx-auto'>
                    <TableContainer >
                        <Table variant='simple'>
                            <Thead>
                                <Tr>
                                    <Th>Submission</Th>
                                    <Th>Created at</Th>
                                    <Th>Created by</Th>
                                    <Th>Status</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {submissions.map((submission) => (
                                    <SubmissionRow key={submission.id} submission={submission} />
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </div>
            </main>
        </>
    );
}
export default ProblemSubmissionsPage;

const SubmissionRow: React.FC<{ submission: any }> = ({ submission }) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const docRef = doc(firestore, "users", submission.userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUser(docSnap.data());
            }
        }

        fetchUser();
    }, [submission.userId]);

    return (
        <Tr>
            <Td>
                <Link className='hover:text-blue-600 cursor-pointer' to={`/submission/${submission.id}`}>
                    {submission.id}
                </Link>
            </Td>
            <Td>{new Date(submission.createdAt.seconds * 1000).toLocaleString()}</Td>
            <Td>{user ? (`${user.displayName} (${user.email})`) : 'Loading...'}</Td>
            <Td>
                {submission.passedCount === submission.totalCount && (
                    <div className='rounded p-[3px] ml-2 text-lg transition-colors duration-200 text-green-s text-dark-green-s'>
                        <BsCheck2Circle />
                    </div>
                )}
            </Td>
        </Tr>
    );
}

const useGetSubmissions = (problemId: string | undefined) => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError('');

            try {
                if (problemId) {
                    const submissionsRef = collection(firestore, 'submissions');
                    const q = query(submissionsRef, where('problemId', '==', problemId));

                    const querySnapshot = await getDocs(q);
                    const fetchedSubmissions: any[] = [];

                    querySnapshot.forEach((doc) => {
                        const submission = doc.data()
                        fetchedSubmissions.push({ ...submission, id: doc.id });
                    });
                    fetchedSubmissions.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

                    setSubmissions(fetchedSubmissions);
                } else {
                    setSubmissions([]);
                }
            } catch (error) {
                console.error('Error fetching submissions:', error);
                setError('Error fetching submissions');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [problemId]);

    return { submissions, loading, error };
};

const useProblem = (problemId: string | undefined) => {
    const [problem, setProblem] = useState<any>(null);
    const [loadingProblem, setLoadingProblem] = useState(true);
    const [errorProblem, setErrorProblem] = useState<string | null>(null);

    useEffect(() => {
        const fetchProblem = async () => {
            if (!problemId) return;
            try {
                const docRef = doc(firestore, "problems", problemId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProblem(docSnap.data());
                } else {
                    setErrorProblem("No such document!");
                }
            } catch (err) {
                setErrorProblem("Failed to fetch problem");
            } finally {
                setLoadingProblem(false);
            }
        };

        fetchProblem();
    }, [problemId]);

    return { problem, loadingProblem, errorProblem };
};
