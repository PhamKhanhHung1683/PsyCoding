import React, { useEffect, useState } from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
} from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';

type SolvedProblemsModalProps = {
    isOpen: boolean;
    handleCloseModal: () => void;
    user: any;
};

const SolvedProblemsModal: React.FC<SolvedProblemsModalProps> = ({ isOpen, handleCloseModal, user }) => {
    const { problems, loading, error } = useGetSolvedProblems(user);

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal}>
            <ModalOverlay />
            <ModalContent className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <ModalHeader className="border-b dark:border-gray-600 pb-2">
                    Solved Problems
                    <br />
                    User: {user.displayName} ({user.email})
                </ModalHeader>
                <ModalBody className="p-4">
                    {loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div>Error: {error}</div>
                    ) : (
                        <ul className="list-none p-0">
                            {problems.map((problem) => (
                                <li key={problem} className="mb-1 text-lg">{problem}</li>
                            ))}
                        </ul>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        bg="black"
                        color="orange"
                        _hover={{ bg: "gray.700", color: "orange.300" }}
                        onClick={handleCloseModal}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SolvedProblemsModal;

const useGetSolvedProblems = (user: any) => {
    const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchSolvedProblems = async () => {
            setLoading(true);
            setError('');

            try {
                const promises = user.solvedProblems.map(async (problemId: string) => {
                    const docRef = doc(firestore, 'problems', problemId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const problemData = docSnap.data();
                        return problemData.title; 
                    }
                });

                const resolvedProblems = await Promise.all(promises);
                setSolvedProblems(resolvedProblems);
            } catch (error) {
                console.error('Error fetching solved problems:', error);
                setError('Failed to fetch solved problems');
            } finally {
                setLoading(false);
            }
        };

        if (user.solvedProblems && user.solvedProblems.length > 0) {
            fetchSolvedProblems();
        } else {
            setSolvedProblems([]);
            setLoading(false);
        }
    }, [user]);

    return { problems: solvedProblems, loading, error };
};
