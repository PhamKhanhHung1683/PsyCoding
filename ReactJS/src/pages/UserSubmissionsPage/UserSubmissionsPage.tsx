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

type UserSubmissionsPageProps = {
    user: any;
};

const UserSubmissionsPage: React.FC<UserSubmissionsPageProps> = ({ user }) => {
    if (!user) return null;
    if (user.role !== 'admin') return null;
    const { userId } = useParams<{ userId: string }>();
    const { submissions, loading, error } = useGetSubmissions(userId);
    const { User, loadingUser, errorUser } = useGetUser(userId);

    if (loading || loadingUser) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>{error}</div>;
    }

    if (errorUser) {
        return <div>{errorUser}</div>;
    }

    if (!submissions) {
        return <div>No submissions found</div>;
    }
    if (!User) {
        return <div>No user found</div>;
    }

    return (
        <>
            <main className="min-h-screen">
                <Topbar user={user} />
                <h1
                    className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium
                    uppercase mt-10 mb-5'
                >
                    Submissions of user: <strong>{User.displayName} ({User.email})</strong>
                </h1>
                <div className='relative overflow-x-auto mx-auto px-6 pb-10 w-full max-w-[1000px] mx-auto'>
                    <TableContainer >
                        <Table variant='simple'>
                            <Thead>
                                <Tr>
                                    <Th>Submission</Th>
                                    <Th>Problem</Th>
                                    <Th>Created at</Th>    
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
export default UserSubmissionsPage;

const SubmissionRow: React.FC<{ submission: any }> = ({ submission }) => {
    return (
        <Tr>
            <Td>
                <Link className='hover:text-blue-600 cursor-pointer' to={`/submission/${submission.id}`}>
                    {submission.id}
                </Link>
            </Td>
            <Td>{submission.problemTitle}</Td>
            <Td>{new Date(submission.createdAt.seconds * 1000).toLocaleString()}</Td>
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

const useGetSubmissions = (userId: string | undefined) => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError('');

            try {
                if (userId) {
                    const submissionsRef = collection(firestore, 'submissions');
                    const q = query(submissionsRef, where('userId', '==', userId));

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
    }, [userId]);

    return { submissions, loading, error };
};

const useGetUser = (userId: string | undefined) => {
    const [User, setUser] = useState<any>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [errorUser, setErrorUser] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const docRef = doc(firestore, "users", userId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data());
                } else {
                    setErrorUser("No user!");
                }
            } catch (err) {
                setErrorUser("Failed to fetch problem");
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, [userId]);

    return { User, loadingUser, errorUser };
}