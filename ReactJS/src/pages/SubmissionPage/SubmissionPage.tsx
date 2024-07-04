import { useEffect, useState } from 'react';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { useParams } from 'react-router-dom';
import Topbar from '../../components/Topbar/Topbar';
import Submission from '../../components/Submission/Submission';

type SubmissionPageProps = {
    user: any
};

const SubmissionPage: React.FC<SubmissionPageProps> = ({ user }) => {
    if(!user) return null;
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
    const { submissionId } = useParams<{ submissionId: string }>();
    const { submission, loading, error } = useSubmission(submissionId);
    if (loading) {
        return;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if(user && user.role !== 'admin' && user.userId !== submission?.userId){
        return null;
    }
    return (
        <>
            <Topbar user={user} />
            <Submission submission={submission} />
        </>
    )
}
export default SubmissionPage;



const useSubmission = (submissionId: string | undefined) => {
    const [submission, setSubmission] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmission = async () => {
            setLoading(true);
            try {
                if (!submissionId) return;
                const submissionRef = doc(firestore, 'submissions', submissionId);
                const submissionDoc = await getDoc(submissionRef);

                if (submissionDoc.exists()) {
                    setSubmission(submissionDoc.data());
                } else {
                    setError(`Submission not found`);
                }
            } catch (error) {
                setError(`Error fetching submission`);
            } finally {
                setLoading(false);
            }
        };

        if (submissionId) {
            fetchSubmission();
        }

        return () => {
            // Cleanup function if needed
        };
    }, [submissionId]);

    return { submission, loading, error };
};


