import React, { useState } from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { toast } from 'react-toastify';
type DeleteProblemModalProps = {
    isDeleteOpen: boolean;
    onDeleteClose: () => void;
    problem: any;
};

const DeleteProblemModal: React.FC<DeleteProblemModalProps> = ({ isDeleteOpen, onDeleteClose, problem }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const submissionsRef = collection(firestore, 'submissions');
            const q = query(submissionsRef, where('problemId', '==', problem.id));
            const querySnapshot = await getDocs(q);

            const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(firestore, 'submissions', docSnap.id)));
            await Promise.all(deletePromises);

            await deleteDoc(doc(firestore, 'problems', problem.id));

            const categoriesCollection = collection(firestore, 'categories');

            for (const category of problem.categories) {
                const categoryDoc = doc(categoriesCollection, category);
                const categoryDocSnapshot = await getDoc(categoryDoc);

                if (categoryDocSnapshot.exists()) {
                    const categoryData = categoryDocSnapshot.data();
                    const newProblemCount = (categoryData.problemCount || 0) - 1;

                    if (newProblemCount > 0) {
                        await updateDoc(categoryDoc, {
                            problemCount: newProblemCount,
                        });
                    } else {
                        await deleteDoc(categoryDoc);
                    }
                }
            }

            toast.success(`Delete problem ${problem.title} successfully!`, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            onDeleteClose();
        } catch (error) {
            toast.error(`Error delete problem: ${error}`, {
                position: "top-center",
                autoClose: false,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Delete problem</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Are you sure to delete this problem: <strong>{problem.title}</strong>?
                    <br />
                    It will delete all submissions of this problem.
                </ModalBody>
                <ModalFooter>
                    <Button bg="black" color="orange" _hover={{ bg: "gray.700", color: "orange.300" }}
                        onClick={handleDelete}
                        disabled={isLoading} // Ngăn chặn click khi isLoading là true
                        style={{ // Điều chỉnh opacity khi isLoading là true
                            opacity: isLoading ? 0.8 : 1,
                            pointerEvents: isLoading ? 'none' : 'auto',
                        }}
                    >
                        {isLoading ? "Loading..." : "Delete"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
export default DeleteProblemModal;