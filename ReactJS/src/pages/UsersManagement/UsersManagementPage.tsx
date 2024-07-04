import React, { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar/Topbar';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Button,
    useDisclosure,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Link,
} from '@chakra-ui/react';
import SolvedProblemsModal from '../../components/Modals/SolvedProblemsModal';
import BanUserModal from '../../components/Modals/BanUserModal';
import PromoteToAdminModal from '../../components/Modals/PromoteToAdminModal';

type UsersManagementProps = {
    user: any
};

const UsersManagementPage: React.FC<UsersManagementProps> = ({ user }) => {
    if(!user) return null;
    if(user.role !== 'admin') return null;
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
    const [errorUsers, setErrorUsers] = useState<string>('');
    const { isOpen: isSovledProblemsOpen, onOpen: onSovledProblemsOpen, onClose: onSovledProblemsClose } = useDisclosure();
    const { isOpen: isBanUserOpen, onOpen: onBanUserOpen, onClose: onBanUserClose } = useDisclosure();
    const { isOpen: isPromoteToAdminOpen, onOpen: onPromoteToAdminOpen, onClose: onPromoteToAdminClose } = useDisclosure();
    const [selectedUser, setSelectedUser] = useState<any>(null);

    useEffect(() => {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('role', '==', 'user'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedUsers: any[] = [];
            querySnapshot.forEach((doc) => {
                fetchedUsers.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            setUsers(fetchedUsers);
            setLoadingUsers(false);
        }, (error) => {
            console.error('Error fetching users:', error);
            setErrorUsers('Failed to fetch users');
            setLoadingUsers(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleOpenSovledProblemsModal = (User: any) => {
        onSovledProblemsOpen();
        setSelectedUser(User);
    };

    const handleOpenBanUserModal = (User: any) => {
        onBanUserOpen();
        setSelectedUser(User);
    };

    const handleOpenPromoteToAdminModal = (User: any) => {
        onPromoteToAdminOpen();
        setSelectedUser(User);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        onSovledProblemsClose();
        onPromoteToAdminClose();
        onBanUserClose();
    };

    if (loadingUsers) {
        return <div>Loading...</div>;
    }

    if (errorUsers) {
        return <div>{errorUsers}</div>;
    }

    return (
        <>
            <main className="min-h-screen">
                <Topbar user={user} />
                <h1
                    className='text-2xl text-center text-gray-700 dark:text-gray-400 font-medium
                    uppercase mt-10 mb-5'
                >
                    You can manage users here
                </h1>
                <div className='relative overflow-x-auto mx-auto px-6 pb-10 w-full max-w-[1000px] mx-auto'>
                    <TableContainer >
                        <Table variant='simple'>
                            <Thead>
                                <Tr>
                                    <Th>Email</Th>
                                    <Th>Name</Th>
                                    <Th>Solved Problems</Th>
                                    <Th>Submissions</Th>
                                    <Th isNumeric>
                                        Administrator actions
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {users.map((User) => (
                                    <Tr key={User.id}>
                                        <Td>
                                            {User.email}
                                        </Td>
                                        <Td>{User.displayName}</Td>
                                        <Td>
                                            <Button onClick={() => handleOpenSovledProblemsModal(User)}>
                                                Click here to see
                                            </Button>
                                        </Td>
                                        <Td>
                                            <Link href={`/userSubmissions/${User.userId}`}>
                                                <Button>View</Button>
                                            </Link>
                                        </Td>
                                        <Td isNumeric>
                                            <Menu>
                                                <MenuButton as={Button} >
                                                    Actions
                                                </MenuButton>
                                                <MenuList>
                                                    <MenuItem onClick={() => handleOpenBanUserModal(User)}>
                                                        {User.banned ? 'Unban user' : 'Ban user'}
                                                    </MenuItem>
                                                    {!User.banned && (
                                                        <MenuItem onClick={() => handleOpenPromoteToAdminModal(User)}>
                                                            Promote user to admin
                                                        </MenuItem>
                                                    )}
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </div>
            </main>
            {selectedUser && (
                <>
                    <SolvedProblemsModal
                        isOpen={isSovledProblemsOpen}
                        handleCloseModal={handleCloseModal}
                        user={selectedUser}
                    />
                    <BanUserModal
                        isOpen={isBanUserOpen}
                        handleCloseModal={handleCloseModal}
                        user={selectedUser}
                    />
                    <PromoteToAdminModal 
                        isOpen={isPromoteToAdminOpen}
                        handleCloseModal={handleCloseModal}
                        user={selectedUser}
                    />
                </>
            )}
        </>
    );
};

export default UsersManagementPage;
