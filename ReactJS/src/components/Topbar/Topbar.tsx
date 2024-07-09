import React from 'react';
import { useSetRecoilState } from 'recoil';
import { authModalState } from '../../atoms/authModalAtom';
import { Link } from 'react-router-dom';
import Logout from '../Buttons/Logout';
import { useDisclosure } from '@chakra-ui/react'

import AddProblemModal from '../Modals/AddProblemModal';

type TopbarProps = {
    user: any;
};

const Topbar: React.FC<TopbarProps> = ({ user }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const setAuthModalState = useSetRecoilState(authModalState);
    
    return (
        <nav className='relative flex h-[50px] w-full shrink-0 items-center px-5 bg-dark-layer-1 text-dark-gray-7'>
            <div className={`flex w-full items-center justify-between max-w-[1200px] mx-auto`}>
                <Link to='/' className='flex items-center justify-center h-20 text-brand-orange text-lg font-semibold'>
                    PsyCoding
                </Link>

                <div className='flex items-center space-x-4 flex-1 justify-end'>
                    {!user && (
                        <Link
                            to='/auth'
                            onClick={() => {
                                setAuthModalState((prev) => ({ ...prev, isOpen: true, type: "login" }));
                            }}
                        >
                            <button className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded '>Sign In</button>
                        </Link>
                    )}
                    {user && user.role === "admin" && (
                        <>
                            <div className='bg-dark-fill-3 py-1.5 px-3 rounded text-brand-orange'
                            >
                                You are an admin
                            </div>
                            <Link className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded ' to='/usersManagement'>
                                Manage users
                            </Link>
                            <button className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded ' onClick={onOpen}>
                                Add problem
                            </button>
                            <AddProblemModal isOpen={isOpen} onClose={onClose} />
                        </>
                    )}
                    {user && (
                        <>
                            <div className='cursor-pointer group relative'>
                                <img src='/avatar.png' alt='Avatar' width={30} height={30} className='rounded-full' />
                                <div
                                    className='absolute top-10 left-2/4 -translate-x-2/4  mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg 
                                    z-40 group-hover:scale-100 scale-0 transition-all duration-300 ease-in-out'
                                >
                                    <p className='text-sm'>Your name: {user.displayName}</p>
                                    <p className='text-sm'>Your email: {user.email}</p>
                                </div>
                            </div>
                            <Logout />
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Topbar;
