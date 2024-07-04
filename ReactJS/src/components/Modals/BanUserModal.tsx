import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
} from '@chakra-ui/react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { toast } from 'react-toastify';

type BanUserModalProps = {
    isOpen: boolean;
    handleCloseModal: () => void;
    user: any;
};

const BanUserModal: React.FC<BanUserModalProps> = ({ isOpen, handleCloseModal, user }) => {

    const handleBanUser = async () => {
        if (!user) return;
        const userRef = doc(firestore, 'users', user.userId);
        try {
            await updateDoc(userRef, {
                banned: true
            });
            toast.success(`User ${user.displayName} (${user.email}) has been banned successfully.`, {
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

    const handleUnbanUser = async () => {
        if (!user) return;
        const userRef = doc(firestore, 'users', user.userId);
        try {
            await updateDoc(userRef, {
                banned: false
            });
            toast.success(`User ${user.displayName} (${user.email}) has been unbanned successfully.`, {
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
            console.error('Error unbanning user:', error);
            toast.error('Failed to unban user. Please try again later.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{user?.banned ? 'Unban User' : 'Ban User'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>
                        {user?.banned ?
                            `Are you sure you want to unban ${user.displayName} (${user.email})?` :
                            `Are you sure you want to ban ${user.displayName} (${user.email})?`}
                    </Text>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme={user?.banned ? 'green' : 'red'} onClick={user?.banned ? handleUnbanUser : handleBanUser}>
                        {user?.banned ? 'Unban' : 'Ban'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
export default BanUserModal;
