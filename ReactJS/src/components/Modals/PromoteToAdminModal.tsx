import React from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
} from '@chakra-ui/react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { toast } from 'react-toastify';

type PromoteToAdminModalProps = {
    isOpen: boolean;
    handleCloseModal: () => void;
    user: any;
};

const PromoteToAdminModal:React.FC<PromoteToAdminModalProps> = ({ isOpen, handleCloseModal, user }) => {
    const handleClick = async () => {
        if (!user) return;
        const userRef = doc(firestore, 'users', user.userId);
        try {
            await updateDoc(userRef, {
                role: 'admin'
            });
            toast.success(`User ${user.displayName} (${user.email}) has been promoted to admin successfully.`, {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            handleCloseModal();
        } catch (error) {
            console.error('Error banning user:', error);
            toast.error('Failed to ban user. Please try again later.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Promote user to admin</ModalHeader>
                <ModalBody>
                    Are you sure to promote <strong>{user.displayName} ({user.email})</strong> to admin ?
                </ModalBody>
                <ModalFooter>
                    <Button onClick={handleClick}>
                        Yes
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
export default PromoteToAdminModal;