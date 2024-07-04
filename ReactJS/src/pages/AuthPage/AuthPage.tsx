import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useRecoilValue } from 'recoil';
import { authModalState } from '../../atoms/authModalAtom';
import AuthModal from '../../components/Modals/AuthModal';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

type AuthPageProps = {};

const AuthPage: React.FC<AuthPageProps> = () => {
    const authModal = useRecoilValue(authModalState);
    const [pageLoading, setPageLoading] = useState(true);
    const [user, loading,] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate("/");
        if (!loading && !user) setPageLoading(false);
    }, [user, navigate, loading]);

    if (pageLoading) return null;
    return (
        <div className='bg-gradient-to-b from-gray-600 to-black h-screen relative'>
            <div className='max-w-7xl mx-auto'>
                <Navbar />
                <div className='flex items-center justify-center h-[calc(100vh-5rem)] pointer-events-none select-none'>
                    <div className='text-center'>
                        <h1 className='text-6xl font-bold text-brand-orange mb-4'>
                            Welcome to PsyCoding
                        </h1>
                        <p className='text-xl text-brand-orange'>
                            The ultimate place to practice C++ coding.
                        </p>
                    </div>
                </div>
                {authModal.isOpen && <AuthModal />}
            </div>
        </div>
    );
}

export default AuthPage;
